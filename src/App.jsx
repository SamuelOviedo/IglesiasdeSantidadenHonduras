import { useState, useMemo, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import BottomSheet from "./components/BottomSheet";
import PanelContent from "./components/PanelContent";
import Icon from "./components/ui/Icon";
import { useChurchData } from "./hooks/useChurchData";
import { useGeolocation } from "./hooks/useGeolocation";
import { useToast } from "./context/ToastContext";

// El mapa (mapbox-gl es pesado) se carga de forma diferida / code-splitting.
const MapView = lazy(() => import("./components/MapView"));
// Componentes de administración: solo se descargan cuando se usan.
const ChurchWizard = lazy(() => import("./components/ChurchWizard"));
const ZoneManager = lazy(() => import("./components/ZoneManager"));

function MapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="flex flex-col items-center gap-3 text-neutral-400">
        <span className="skeleton h-12 w-12 rounded-full" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  );
}

const readFlag = (key) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

export default function App() {
  const toast = useToast();
  const data = useChurchData();
  const gps = useGeolocation();

  const [darkMode, setDarkMode] = useState(() => readFlag("darkMode"));
  const [adminMode, setAdminMode] = useState(() => readFlag("adminMode"));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState({
    origin: null,
    destination: null,
    useUserLocation: false,
  });
  const [detailChurch, setDetailChurch] = useState(null);
  const [customDest, setCustomDest] = useState(null);
  const [wizard, setWizard] = useState(null); // { mode, church, prefillCoords }
  const [zoneManagerOpen, setZoneManagerOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickInitial, setPickInitial] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const pickResolver = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", darkMode ? "1" : "0");
    } catch {
      /* almacenamiento no disponible */
    }
  }, [darkMode]);
  useEffect(() => {
    try {
      localStorage.setItem("adminMode", adminMode ? "1" : "0");
    } catch {
      /* almacenamiento no disponible */
    }
  }, [adminMode]);

  /* ------------------------------ Derivados ----------------------------- */
  const activeZoneName = useMemo(
    () => data.zonas.find((z) => z.id === data.activeZone)?.nombre ?? "",
    [data.zonas, data.activeZone],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.iglesias;
    return data.iglesias.filter(
      (i) =>
        (i.nombre ?? "").toLowerCase().includes(q) ||
        (i.descripcion ?? "").toLowerCase().includes(q) ||
        (i.ciudad ?? "").toLowerCase().includes(q),
    );
  }, [query, data.iglesias]);

  const subtitleFor = useCallback(
    (church) => church.ciudad || activeZoneName,
    [activeZoneName],
  );

  const focusMap = useCallback((lng, lat, zoom) => {
    setMapFocus((prev) => ({ lng, lat, zoom, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  /* ------------------------------- Modos -------------------------------- */
  const toggleDark = () => setDarkMode((d) => !d);
  const toggleAdmin = () => {
    setAdminMode((a) => {
      const next = !a;
      toast.info(next ? "Modo administración activado" : "Modo navegación");
      return next;
    });
  };

  /* ------------------------------ Selección ----------------------------- */
  const onZoneChange = (id) => {
    data.setActiveZone(id);
    setSelected({ origin: null, destination: null, useUserLocation: false });
    setCustomDest(null);
    setDetailChurch(null);
    setQuery("");
  };

  const setDestination = (id) => {
    setCustomDest(null);
    setSelected((prev) => ({
      ...prev,
      destination: prev.destination === id ? null : id,
    }));
  };

  const setOrigin = (id) => {
    setSelected((prev) => ({
      ...prev,
      origin: prev.origin === id ? null : id,
      useUserLocation: prev.origin === id ? prev.useUserLocation : false,
    }));
  };

  const toggleUserLocation = async () => {
    const turningOn = !selected.useUserLocation;
    setSelected((prev) => ({
      ...prev,
      useUserLocation: turningOn,
      origin: turningOn ? null : prev.origin,
    }));
    if (turningOn) {
      try {
        await gps.request();
      } catch {
        toast.error("No se pudo obtener tu ubicación");
      }
    }
  };

  const onSelectChurch = (church) => {
    setDetailChurch(church);
    focusMap(church.lng, church.lat, 15);
  };

  const onNavigate = async (church) => {
    setCustomDest(null);
    const needsGps = !selected.origin;
    setSelected((prev) => ({
      ...prev,
      destination: church.id,
      useUserLocation: needsGps ? true : prev.useUserLocation,
    }));
    if (needsGps) {
      try {
        await gps.request();
      } catch {
        toast.error("Activa la ubicación para trazar la ruta");
      }
    }
    focusMap(church.lng, church.lat, 13);
  };

  const clearRoute = () => {
    setCustomDest(null);
    setSelected((prev) => ({ ...prev, destination: null }));
  };

  /* -------------------------------- CRUD -------------------------------- */
  const onDelete = async (church) => {
    if (!confirm(`¿Eliminar “${church.nombre}”?`)) return;
    try {
      await data.removeChurch(church.id);
      if (detailChurch?.id === church.id) setDetailChurch(null);
      setSelected((prev) => ({
        ...prev,
        origin: prev.origin === church.id ? null : prev.origin,
        destination: prev.destination === church.id ? null : prev.destination,
      }));
      toast.success("Iglesia eliminada");
    } catch {
      toast.error("No se pudo eliminar la iglesia");
    }
  };

  const onEdit = (church) => setWizard({ mode: "edit", church });
  const onAddChurch = () => setWizard({ mode: "add" });

  const saveChurch = async (form) => {
    if (wizard?.mode === "add") {
      await data.addChurch(form);
      if (form.zona_id !== data.activeZone) data.setActiveZone(form.zona_id);
    } else {
      await data.editChurch(wizard.church.id, form);
      if (detailChurch?.id === wizard.church.id) {
        setDetailChurch({ ...wizard.church, ...form });
      }
    }
  };

  /* -------------------- Selector de ubicación en mapa ------------------- */
  const requestMapPick = useCallback(
    (initial) =>
      new Promise((resolve) => {
        pickResolver.current = resolve;
        setPickInitial(initial ?? null);
        setPicking(true);
      }),
    [],
  );

  const finishPick = useCallback((value) => {
    setPicking(false);
    setPickInitial(null);
    const resolve = pickResolver.current;
    pickResolver.current = null;
    resolve?.(value);
  }, []);

  /* -------------------------- Menú contextual --------------------------- */
  const onAddHere = (lngLat) => {
    if (!adminMode) return;
    setWizard({ mode: "add", prefillCoords: { lat: lngLat.lat, lng: lngLat.lng } });
  };

  const onRouteHere = async (lngLat) => {
    setSelected((prev) => ({
      ...prev,
      destination: null,
      useUserLocation: true,
    }));
    setCustomDest({ lat: lngLat.lat, lng: lngLat.lng });
    try {
      await gps.request();
    } catch {
      toast.error("Activa la ubicación para trazar la ruta");
    }
  };

  /* ------------------------------ Panel ui ------------------------------ */
  const selectionState = { ...selected, detailId: detailChurch?.id ?? null };
  const detailZoneName =
    data.zonas.find((z) => z.id === detailChurch?.zona_id)?.nombre ??
    activeZoneName;

  const panelProps = {
    zonas: data.zonas,
    activeZone: data.activeZone,
    counts: data.counts,
    churches: filtered,
    loading: data.iglesiasLoading || data.zonasLoading,
    query,
    setQuery,
    selected: selectionState,
    detailChurch,
    zoneName: detailZoneName,
    subtitleFor,
    adminMode,
    onToggleAdmin: toggleAdmin,
    darkMode,
    onToggleDark: toggleDark,
    gpsActive: selected.useUserLocation,
    gpsLoading: gps.loading,
    onToggleGps: toggleUserLocation,
    onZoneChange,
    onManageZones: () => setZoneManagerOpen(true),
    onSelectChurch,
    onCloseDetails: () => setDetailChurch(null),
    onSetOrigin: setOrigin,
    onSetDestination: setDestination,
    onNavigate,
    onEdit,
    onDelete,
    onAddChurch,
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="relative flex h-screen w-screen overflow-hidden bg-neutral-50 font-sans dark:bg-neutral-950">
        {/* Panel de escritorio */}
        <Sidebar>
          <PanelContent {...panelProps} />
        </Sidebar>

        {/* Mapa */}
        <main className="relative flex-1">
          <Suspense fallback={<MapFallback />}>
            <MapView
              iglesias={data.iglesias}
              selected={selectionState}
              zonas={data.zonas}
              activeZone={data.activeZone}
              darkMode={darkMode}
              userLocation={gps.location}
              adminMode={adminMode}
              onSelectChurch={onSelectChurch}
              pickingMode={picking}
              pickInitial={pickInitial}
              onPickConfirm={finishPick}
              onPickCancel={() => finishPick(null)}
              customDest={customDest}
              onClearRoute={clearRoute}
              onAddHere={onAddHere}
              onRouteHere={onRouteHere}
              mapFocus={mapFocus}
            />
          </Suspense>

          {/* Controles flotantes móviles (brand + modos) */}
          {!picking && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3 md:hidden">
              <span className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-600 shadow-md backdrop-blur dark:bg-neutral-900/95 dark:text-emerald-400">
                Iglesias · Honduras
              </span>
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleDark}
                  aria-label="Cambiar tema"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-500 shadow-md backdrop-blur dark:bg-neutral-900/95 dark:text-neutral-300"
                >
                  <Icon name={darkMode ? "sun" : "moon"} size={16} />
                </button>
                <button
                  type="button"
                  onClick={toggleAdmin}
                  aria-pressed={adminMode}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium shadow-md backdrop-blur ${
                    adminMode
                      ? "bg-emerald-600 text-white"
                      : "bg-white/95 text-neutral-500 dark:bg-neutral-900/95 dark:text-neutral-300"
                  }`}
                >
                  <Icon name="shield" size={14} />
                  Admin
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Bottom sheet móvil (oculto durante la selección en el mapa) */}
        {!picking && (
          <BottomSheet>
            <PanelContent {...panelProps} showBrand={false} />
          </BottomSheet>
        )}

        {/* Modales de administración: chunks diferidos, sin fallback visible
            (son pequeños y se muestran al terminar de cargar). */}
        <Suspense fallback={null}>
          {/* Asistente de iglesia (oculto mientras se elige punto en el mapa) */}
          {wizard && (
            <div className={picking ? "hidden" : ""}>
              <ChurchWizard
                mode={wizard.mode}
                church={wizard.church}
                prefillCoords={wizard.prefillCoords}
                zonas={data.zonas}
                activeZone={data.activeZone}
                onClose={() => setWizard(null)}
                onSave={saveChurch}
                requestMapPick={requestMapPick}
                requestGps={gps.request}
                onPreviewLocation={(lng, lat) => focusMap(lng, lat, 15)}
              />
            </div>
          )}

          {/* Gestión de zonas */}
          {zoneManagerOpen && (
            <div className={picking ? "hidden" : ""}>
              <ZoneManager
                zonas={data.zonas}
                counts={data.counts}
                onClose={() => setZoneManagerOpen(false)}
                onCreate={data.addZone}
                onUpdate={data.editZone}
                onDelete={data.removeZone}
                requestMapPick={requestMapPick}
              />
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
