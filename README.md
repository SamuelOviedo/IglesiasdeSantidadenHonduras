# Iglesias de Santidad en Honduras

Aplicación web para explorar en un mapa interactivo las **Iglesias de Santidad de Honduras**, organizadas por zona, con cálculo de rutas de manejo entre iglesias o desde tu ubicación actual.

## ¿Qué hace?

- 🗺️ **Mapa interactivo** (Mapbox GL) con las iglesias marcadas por zona.
- 📍 **Zonas geográficas**: al elegir una zona el mapa vuela a su centro y lista sus iglesias.
- 🚗 **Cálculo de rutas** de manejo (Mapbox Directions API) entre dos iglesias, o desde tu ubicación GPS hasta una iglesia, mostrando distancia (km) y tiempo estimado (min).
- ✏️ **Administración (CRUD)**: crear, editar y eliminar iglesias, persistidas en Supabase.
- 🌙 **Modo claro / oscuro** y diseño responsive (barra lateral en escritorio, menú hamburguesa en móvil).

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + Vite |
| Estilos | Tailwind CSS 4 |
| Mapa / rutas | Mapbox GL (`react-map-gl`) + Directions API |
| Datos | Supabase (Postgres) |
| Lint | ESLint 9 |

## Estructura

```
src/
├─ App.jsx              # Orquesta estado global (zonas, iglesias, selección, modales)
├─ components/
│  ├─ MapView.jsx       # Mapa, marcadores y renderizado de la ruta
│  ├─ Sidebar.jsx       # Selector de zona, lista de iglesias, controles
│  ├─ ChurchModal.jsx   # Formulario de alta/edición de iglesias
│  └─ BottomBar.jsx     # Barra inferior con el destino seleccionado
└─ utils/               # Lógica central (fuera de la UI)
   ├─ api.js            # Acceso a datos Supabase (zonas + CRUD de iglesias)
   └─ routing.js        # Mapbox: token, estilos de mapa y cálculo de rutas
```

## Configuración

Requiere Node.js 18+.

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` a partir de la plantilla y completa tus credenciales:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_MAPBOX_TOKEN=tu_token_de_mapbox
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

   > `.env` está en `.gitignore`; nunca lo subas al repositorio.

3. Base de datos (Supabase): la app espera dos tablas.
   - `zonas`: `id`, `nombre`, `lat_centro`, `lng_centro`
   - `iglesias`: `id`, `zona_id`, `nombre`, `lat`, `lng`, `descripcion`

## Scripts

```bash
npm run dev       # Servidor de desarrollo (Vite + HMR)
npm run build     # Build de producción
npm run preview   # Previsualiza el build
npm run lint      # ESLint
```
