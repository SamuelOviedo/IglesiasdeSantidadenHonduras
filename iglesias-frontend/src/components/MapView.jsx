import { useState, useEffect, useRef } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({
  iglesias,
  selected,
  zonas,
  activeZone,
  darkMode,
  onSetDestination,
}) {
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const mapRef = useRef();

  // Calculate route when origin + destination are set
  useEffect(() => {
    if (!selected.destination) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }
    if (!selected.origin) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }
    const iglesiaOrigin = iglesias.find((ig) => ig.id === selected.origin);
    const iglesiaDest = iglesias.find((ig) => ig.id === selected.destination);
    if (!iglesiaOrigin || !iglesiaDest) return;

    setLoadingRoute(true);
    getRoute(
      { lat: iglesiaOrigin.lat, lng: iglesiaOrigin.lng },
      { lat: iglesiaDest.lat, lng: iglesiaDest.lng }
    );
  }, [selected, iglesias]);

  async function getRoute(start, end) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
        { method: "GET" }
      );
      const json = await res.json();
      if (!json.routes || json.routes.length === 0) throw new Error("No route found");
      const data = json.routes[0];
      setRoute({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: data.geometry.coordinates },
      });
      setRouteInfo({
        distance: (data.distance / 1000).toFixed(2),
        duration: Math.round(data.duration / 60),
      });
    } catch {
      setToastMessage("No se pudo calcular la ruta para este destino");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setLoadingRoute(false);
    }
  }

  // Fly to zone center when zone changes
  useEffect(() => {
    if (!activeZone || !mapRef.current) return;
    const zona = zonas.find((z) => z.id === activeZone);
    if (zona) {
      mapRef.current.flyTo({
        center: [zona.lng_centro, zona.lat_centro],
        zoom: 12,
        duration: 800,
      });
    }
  }, [activeZone, zonas]);

  const mapStyle = darkMode
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/light-v11";

  const originName = iglesias.find((ig) => ig.id === selected.origin)?.nombre;
  const destName = iglesias.find((ig) => ig.id === selected.destination)?.nombre;

  return (
    <div className="flex-1 w-full relative min-h-0">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -86, latitude: 15, zoom: 8 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {iglesias.map((ig) => (
          <Marker
            key={ig.id}
            longitude={ig.lng}
            latitude={ig.lat}
            color={
              selected.origin === ig.id
                ? "#3b82f6"
                : selected.destination === ig.id
                  ? "#10b981"
                  : "#60a5fa"
            }
            onClick={() => onSetDestination(ig.id)}
          />
        ))}

        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer
              id="route"
              type="line"
              source="route"
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#10b981", "line-width": 4, "line-opacity": 0.85 }}
            />
          </Source>
        )}
      </Map>

      {/* Route info panel */}
      {routeInfo && selected.destination && !loadingRoute && (
        <div className="absolute top-4 right-4 bg-white dark:bg-neutral-900 rounded-xl p-3 shadow-lg w-[min(220px,calc(100vw-5rem))] animate-slide-in-right">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 leading-snug mb-2 line-clamp-2">
            {originName ?? "—"} → {destName ?? "—"}
          </p>
          <div className="flex gap-3">
            <div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Distancia</p>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {routeInfo.distance} km
              </p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Tiempo est.</p>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {routeInfo.duration} min
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loadingRoute && (
        <div className="absolute top-4 right-4 bg-white dark:bg-neutral-900 rounded-xl px-4 py-3 shadow-lg animate-slide-in-right flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Calculando ruta...
          </p>
        </div>
      )}

      {/* Error toast */}
      {showToast && (
        <div className="absolute bottom-20 right-4 bg-neutral-800 dark:bg-neutral-700 text-white rounded-xl px-4 py-3 shadow-lg max-w-[calc(100vw-2rem)] animate-slide-up">
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
