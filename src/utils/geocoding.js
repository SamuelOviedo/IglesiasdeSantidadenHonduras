// Lógica central de geocodificación (Mapbox Geocoding API v6).
// Mantiene todo el ecosistema en Mapbox: mismo token que el mapa y las rutas.

import { MAPBOX_TOKEN } from "./routing";

const BASE = "https://api.mapbox.com/search/geocode/v6";

// Centro aproximado de Honduras, usado como sesgo de proximidad por defecto.
export const HONDURAS_CENTER = { lng: -86.5, lat: 14.8 };

// Normaliza una feature de la API v6 a una forma estable para la UI.
function normalize(feature) {
  const props = feature?.properties ?? {};
  const coords =
    feature?.geometry?.coordinates ??
    (props.coordinates
      ? [props.coordinates.longitude, props.coordinates.latitude]
      : null);
  if (!coords) return null;
  const ctx = props.context ?? {};
  return {
    id: props.mapbox_id ?? `${coords[0]},${coords[1]}`,
    name: props.name ?? props.name_preferred ?? "Ubicación",
    address: props.full_address ?? props.place_formatted ?? "",
    lng: coords[0],
    lat: coords[1],
    context: {
      street: ctx.street?.name ?? ctx.address?.name ?? "",
      city: ctx.place?.name ?? ctx.locality?.name ?? "",
      region: ctx.region?.name ?? "",
      country: ctx.country?.name ?? "",
    },
  };
}

// Búsqueda directa: dirección, lugar, ciudad, punto de interés (autocomplete).
export async function forwardGeocode(query, { proximity, signal } = {}) {
  const q = (query ?? "").trim();
  if (q.length < 3) return [];
  const prox = proximity ?? HONDURAS_CENTER;
  const url =
    `${BASE}/forward?q=${encodeURIComponent(q)}` +
    `&access_token=${MAPBOX_TOKEN}` +
    `&language=es&country=hn&limit=6&autocomplete=true` +
    `&proximity=${prox.lng},${prox.lat}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Geocoding failed");
  const json = await res.json();
  return (json.features ?? []).map(normalize).filter(Boolean);
}

// Geocodificación inversa: de coordenadas a la dirección más cercana.
export async function reverseGeocode(lng, lat, { signal } = {}) {
  const url =
    `${BASE}/reverse?longitude=${lng}&latitude=${lat}` +
    `&access_token=${MAPBOX_TOKEN}&language=es&limit=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const json = await res.json();
  const first = (json.features ?? [])[0];
  return first ? normalize(first) : null;
}
