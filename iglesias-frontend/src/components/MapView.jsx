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
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const mapRef = useRef();

  // Get user location only if enabled
  useEffect(() => {
    if (!selected.useUserLocation) {
      setUserLocation(null);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setToastMessage("No se pudo obtener tu ubicación");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        },
      );
    }
  }, [selected.useUserLocation]);

  // Get route when destination and origin are set
  useEffect(() => {
    if (!selected.destination) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }
    let start = null;
    if (selected.useUserLocation && userLocation) {
      start = userLocation;
    } else if (selected.origin) {
      const iglesia = iglesias.find((ig) => ig.id === selected.origin);
      if (iglesia) start = { lat: iglesia.lat, lng: iglesia.lng };
    }
    if (!start) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }
    const iglesiaDest = iglesias.find((ig) => ig.id === selected.destination);
    if (!iglesiaDest) return;

    setLoadingRoute(true);
    getRoute(start, { lat: iglesiaDest.lat, lng: iglesiaDest.lng });
  }, [selected, userLocation, iglesias]);

  // Get route from Mapbox Directions API
  async function getRoute(start, end) {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
        { method: "GET" },
      );
      const json = await query.json();
      console.log("Mapbox Directions API Response:", json); // Log completo del JSON
      if (!json.routes || json.routes.length === 0) {
        throw new Error("No route found");
      }
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      };
      setRoute(geojson);
      setRouteInfo({
        distance: (data.distance / 1000).toFixed(2), // km
        duration: Math.round(data.duration / 60), // minutes
      });
    } catch (error) {
      console.error("Error fetching route:", error);
      setToastMessage("No se pudo calcular la ruta vial para este destino");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setLoadingRoute(false);
    }
  }

  // Fly to zone center
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

  return (
    <div className="flex-1 w-full relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -86,
          latitude: 15,
          zoom: 8,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* User location marker (only if using user location) */}
        {selected.useUserLocation && userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            color="red"
          />
        )}

        {/* Church markers */}
        {iglesias.map((ig) => (
          <Marker
            key={ig.id}
            longitude={ig.lng}
            latitude={ig.lat}
            color={
              selected.origin === ig.id
                ? "blue"
                : selected.destination === ig.id
                  ? "#10b981"
                  : "#3b82f6"
            }
            onClick={() => onSetDestination(ig.id)}
          />
        ))}

        {/* Route */}
        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer
              id="route"
              type="line"
              source="route"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#10b981",
                "line-width": 4,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Route info panel */}
      {routeInfo && selected.destination && (
        <div className="absolute top-4 right-4 bg-white dark:bg-neutral-900 rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
            Ruta desde{" "}
            {selected.useUserLocation
              ? "tu ubicación"
              : iglesias.find((ig) => ig.id === selected.origin)?.nombre ||
                "origen desconocido"}{" "}
            hasta{" "}
            {iglesias.find((ig) => ig.id === selected.destination)?.nombre}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Distancia: {routeInfo.distance} km
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Tiempo estimado: {routeInfo.duration} min
          </p>
        </div>
      )}

      {/* Loading state */}
      {loadingRoute && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-lg p-4 shadow-lg max-w-xs">
          <p className="text-sm font-semibold">Calculando ruta...</p>
        </div>
      )}

      {/* Error toast */}
      {showToast && (
        <div className="absolute bottom-4 right-4 bg-red-500 text-white rounded-lg p-4 shadow-lg max-w-xs">
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
