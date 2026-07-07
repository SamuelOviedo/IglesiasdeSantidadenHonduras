import { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_STYLES, getRoute } from "../utils/routing";
import { useToast } from "../context/ToastContext";
import Icon from "./ui/Icon";
import MapContextMenu from "./MapContextMenu";

const ROUTE_LAYER = {
  id: "route",
  type: "line",
  source: "route",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: { "line-color": "#10b981", "line-width": 4, "line-opacity": 0.85 },
};

export default function MapView({
  iglesias,
  selected,
  zonas,
  activeZone,
  darkMode,
  userLocation,
  adminMode,
  onSelectChurch,
  pickingMode,
  pickInitial,
  onPickConfirm,
  onPickCancel,
  customDest,
  onClearRoute,
  onAddHere,
  onRouteHere,
  mapFocus,
}) {
  const toast = useToast();
  const mapRef = useRef();
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [pickLngLat, setPickLngLat] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const mapStyle = darkMode ? MAP_STYLES.dark : MAP_STYLES.light;

  /* --------------------------- Cálculo de ruta -------------------------- */
  useEffect(() => {
    const destChurch = selected.destination
      ? iglesias.find((ig) => ig.id === selected.destination)
      : null;
    const endPoint = destChurch
      ? { lat: destChurch.lat, lng: destChurch.lng }
      : customDest
        ? { lat: customDest.lat, lng: customDest.lng }
        : null;

    if (!endPoint) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }

    let start = null;
    if (selected.useUserLocation && userLocation) {
      start = userLocation;
    } else if (selected.origin) {
      const origin = iglesias.find((ig) => ig.id === selected.origin);
      if (origin) start = { lat: origin.lat, lng: origin.lng };
    }
    if (!start) {
      setRoute(null);
      setRouteInfo(null);
      return;
    }

    let cancelled = false;
    setLoadingRoute(true);
    getRoute(start, endPoint)
      .then(({ geojson, info }) => {
        if (cancelled) return;
        setRoute(geojson);
        setRouteInfo(info);
      })
      .catch(() => {
        if (cancelled) return;
        setRoute(null);
        setRouteInfo(null);
        toast.error("No se pudo calcular la ruta vial para este destino");
      })
      .finally(() => {
        if (!cancelled) setLoadingRoute(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, userLocation, iglesias, customDest]);

  /* --------------------- Vuelo al centro de la zona --------------------- */
  useEffect(() => {
    if (!activeZone || !mapRef.current) return;
    const zona = zonas.find((z) => z.id === activeZone);
    if (zona?.lng_centro != null && zona?.lat_centro != null) {
      mapRef.current.flyTo({
        center: [zona.lng_centro, zona.lat_centro],
        zoom: 12,
        duration: 800,
      });
    }
  }, [activeZone, zonas]);

  /* ------------------------- Enfoque programático ----------------------- */
  useEffect(() => {
    if (mapFocus && mapRef.current) {
      mapRef.current.flyTo({
        center: [mapFocus.lng, mapFocus.lat],
        zoom: mapFocus.zoom ?? 15,
        duration: 800,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFocus?.nonce]);

  /* -------------------------- Modo selección ---------------------------- */
  useEffect(() => {
    setPickLngLat(pickingMode ? (pickInitial ?? null) : null);
  }, [pickingMode, pickInitial]);

  const handleMapClick = useCallback(
    (evt) => {
      if (contextMenu) setContextMenu(null);
      if (pickingMode) {
        setPickLngLat({ lng: evt.lngLat.lng, lat: evt.lngLat.lat });
      }
    },
    [contextMenu, pickingMode],
  );

  const handleContextMenu = useCallback(
    (evt) => {
      evt.preventDefault?.();
      if (pickingMode) return;
      setContextMenu({
        x: evt.point.x,
        y: evt.point.y,
        lngLat: { lng: evt.lngLat.lng, lat: evt.lngLat.lat },
      });
    },
    [pickingMode],
  );

  const centerHere = (lngLat) =>
    mapRef.current?.flyTo({ center: [lngLat.lng, lngLat.lat], duration: 600 });

  const contextItems = contextMenu
    ? [
        ...(adminMode
          ? [
              {
                label: "Agregar iglesia aquí",
                icon: "plus",
                onClick: () => onAddHere(contextMenu.lngLat),
              },
            ]
          : []),
        {
          label: "Cómo llegar aquí",
          icon: "navigation",
          onClick: () => onRouteHere(contextMenu.lngLat),
        },
        {
          label: "Centrar mapa aquí",
          icon: "crosshair",
          onClick: () => centerHere(contextMenu.lngLat),
        },
      ]
    : [];

  const destName = selected.destination
    ? iglesias.find((ig) => ig.id === selected.destination)?.nombre
    : "Punto seleccionado";
  const originName = selected.useUserLocation
    ? "tu ubicación"
    : iglesias.find((ig) => ig.id === selected.origin)?.nombre || "origen";

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -86, latitude: 15, zoom: 8 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor={pickingMode ? "crosshair" : "grab"}
        onClick={handleMapClick}
        onContextMenu={handleContextMenu}
      >
        {/* Ubicación del usuario */}
        {selected.useUserLocation && userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            color="#2563eb"
          />
        )}

        {/* Iglesias */}
        {iglesias.map((ig) => (
          <Marker
            key={ig.id}
            longitude={ig.lng}
            latitude={ig.lat}
            color={
              selected.origin === ig.id
                ? "#2563eb"
                : selected.destination === ig.id
                  ? "#10b981"
                  : "#3b82f6"
            }
            onClick={(e) => {
              e.originalEvent?.stopPropagation?.();
              if (!pickingMode) onSelectChurch(ig);
            }}
          />
        ))}

        {/* Destino personalizado (menú contextual "cómo llegar aquí") */}
        {customDest && !selected.destination && (
          <Marker
            longitude={customDest.lng}
            latitude={customDest.lat}
            color="#10b981"
          />
        )}

        {/* Marcador temporal del selector de ubicación (arrastrable) */}
        {pickingMode && pickLngLat && (
          <Marker
            longitude={pickLngLat.lng}
            latitude={pickLngLat.lat}
            color="#f59e0b"
            draggable
            onDragEnd={(e) =>
              setPickLngLat({ lng: e.lngLat.lng, lat: e.lngLat.lat })
            }
          />
        )}

        {/* Ruta */}
        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer {...ROUTE_LAYER} />
          </Source>
        )}
      </Map>

      {/* Menú contextual */}
      {contextMenu && (
        <MapContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Overlay del modo selección */}
      {pickingMode && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-neutral-900/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur">
              <Icon name="crosshair" size={16} />
              {pickLngLat
                ? "Arrastra el marcador para ajustar"
                : "Toca el mapa para ubicar la iglesia"}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center gap-2 p-4 pb-safe">
            <button
              type="button"
              onClick={onPickCancel}
              className="min-h-[44px] rounded-xl bg-white px-5 text-sm font-medium text-neutral-600 shadow-lg hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!pickLngLat}
              onClick={() => pickLngLat && onPickConfirm(pickLngLat)}
              className="min-h-[44px] rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              Confirmar ubicación
            </button>
          </div>
        </>
      )}

      {/* Panel de información de ruta */}
      {routeInfo && !pickingMode && (
        <div className="absolute left-4 top-16 z-20 max-w-[240px] rounded-2xl border border-neutral-100 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 md:top-4 animate-slide-up">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Icon name="route" size={15} /> Ruta
            </div>
            <button
              type="button"
              onClick={onClearRoute}
              aria-label="Limpiar ruta"
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Desde <span className="font-medium">{originName}</span> hasta{" "}
            <span className="font-medium">{destName}</span>
          </p>
          <div className="mt-2 flex gap-4">
            <div>
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-50">
                {routeInfo.distance}
              </p>
              <p className="text-[11px] text-neutral-400">km</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-50">
                {routeInfo.duration}
              </p>
              <p className="text-[11px] text-neutral-400">min</p>
            </div>
          </div>
        </div>
      )}

      {/* Estado de carga de la ruta */}
      {loadingRoute && !pickingMode && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg animate-fade-in">
          Calculando ruta...
        </div>
      )}
    </div>
  );
}
