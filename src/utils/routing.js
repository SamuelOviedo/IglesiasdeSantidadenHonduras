// Lógica central de Mapbox: token, estilos de mapa y cálculo de rutas.
// Extraído de MapView para mantener la lógica de negocio fuera de la UI.

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MAP_STYLES = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
};

// Pide a la Directions API de Mapbox una ruta en auto entre dos puntos {lat, lng}.
// Devuelve { geojson, info: { distance (km), duration (min) } } o lanza un error.
export async function getRoute(start, end) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
    { method: "GET" },
  );
  const json = await query.json();
  if (!json.routes || json.routes.length === 0) {
    throw new Error("No route found");
  }
  const data = json.routes[0];
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: data.geometry.coordinates,
    },
  };
  return {
    geojson,
    info: {
      distance: (data.distance / 1000).toFixed(2), // km
      duration: Math.round(data.duration / 60), // minutos
    },
  };
}
