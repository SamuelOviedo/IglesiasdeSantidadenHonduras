import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // El bundler (Rolldown, vía rolldown-vite) acepta la API de manualChunks
    // de Rollup. Separamos las dependencias grandes en chunks cacheables e
    // independientes para reducir el bundle de entrada y paralelizar la carga.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // mapbox-gl + react-map-gl: solo se cargan cuando <MapView> (lazy)
          // se monta, por lo que este chunk queda diferido.
          if (id.includes("mapbox-gl") || id.includes("react-map-gl"))
            return "mapbox-gl";
          if (id.includes("@supabase")) return "supabase";
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/.test(
              id,
            )
          )
            return "react-vendor";
          return "vendor";
        },
      },
    },
    // Tras el code-splitting, el ÚNICO chunk que supera 1 MB es mapbox-gl
    // (~1.76 MB min): un motor de mapas de tamaño irreducible, aislado en su
    // propio chunk y cargado de forma diferida (solo al montar <MapView>), por
    // lo que NO afecta al arranque. Todo lo que controlamos queda muy por
    // debajo: entrada ~28 KB, react-vendor ~179 KB, supabase ~186 KB.
    // Fijamos el umbral justo por encima de mapbox para que cualquier chunk
    // propio que crezca sin control (regresión real) sí dispare el aviso.
    chunkSizeWarningLimit: 1800,
  },
});
