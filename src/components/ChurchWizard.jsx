import { useState, useEffect, useMemo } from "react";
import Icon from "./ui/Icon";
import { useToast } from "../context/ToastContext";
import { useGeocoding } from "../hooks/useGeocoding";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { reverseGeocode, HONDURAS_CENTER } from "../utils/geocoding";

// Asistente de 2 pasos para crear/editar iglesia.
// Paso 1: información. Paso 2: ubicación (buscar dirección / mapa / GPS).
// Lat/lng pasan a ser "información avanzada", no la entrada principal.
export default function ChurchWizard({
  mode,
  church,
  zonas,
  activeZone,
  prefillCoords,
  onClose,
  onSave,
  requestMapPick,
  requestGps,
  onPreviewLocation,
}) {
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    zona_id: activeZone ?? "",
  });
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [address, setAddress] = useState(null); // reverse geocode result
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const proximity = useMemo(() => coords ?? HONDURAS_CENTER, [coords]);
  const geo = useGeocoding(proximity);
  const debouncedQuery = useDebouncedValue(addressQuery, 350);

  // Precarga en modo edición o desde el menú contextual del mapa.
  useEffect(() => {
    if (mode === "edit" && church) {
      setForm({
        nombre: church.nombre ?? "",
        descripcion: church.descripcion ?? "",
        zona_id: church.zona_id ?? activeZone ?? "",
      });
      if (church.lat != null && church.lng != null) {
        setCoords({ lat: parseFloat(church.lat), lng: parseFloat(church.lng) });
      }
    } else if (prefillCoords) {
      setCoords(prefillCoords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autocompletado de direcciones. Depende solo de la consulta estabilizada
  // (geo se recrea cada render; incluirlo dispararía búsquedas en bucle).
  useEffect(() => {
    geo.search(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Geocodificación inversa cada vez que cambian las coordenadas.
  useEffect(() => {
    if (!coords) {
      setAddress(null);
      return;
    }
    const controller = new AbortController();
    setAddressLoading(true);
    reverseGeocode(coords.lng, coords.lat, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setAddress(res);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setAddressLoading(false);
      });
    return () => controller.abort();
  }, [coords]);

  const applyLocation = (lng, lat) => {
    setCoords({ lat, lng });
    onPreviewLocation?.(lng, lat);
  };

  const pickOnMap = async () => {
    const picked = await requestMapPick(coords);
    if (picked) applyLocation(picked.lng, picked.lat);
  };

  const useGps = async () => {
    try {
      const loc = await requestGps();
      if (loc) applyLocation(loc.lng, loc.lat);
    } catch {
      toast.error("No se pudo obtener tu ubicación");
    }
  };

  const selectResult = (r) => {
    applyLocation(r.lng, r.lat);
    setAddressQuery("");
    geo.clear();
  };

  const canContinue = form.nombre.trim() && form.zona_id;
  const canSave = canContinue && coords;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        zona_id: form.zona_id,
        lat: coords.lat,
        lng: coords.lng,
      });
      toast.success(mode === "add" ? "Iglesia creada" : "Cambios guardados");
      onClose();
    } catch {
      toast.error("No se pudo guardar la iglesia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-3xl animate-slide-up">
        {/* Cabecera + progreso */}
        <div className="border-b border-neutral-100 px-5 pb-3 pt-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-50">
              {mode === "add" ? "Nueva iglesia" : "Editar iglesia"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step >= s
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                  }`}
                >
                  {step > s ? <Icon name="check" size={13} /> : s}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step >= s
                      ? "text-neutral-700 dark:text-neutral-200"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {s === 1 ? "Información" : "Ubicación"}
                </span>
                {s === 1 && (
                  <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-5 py-4">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Nombre de la iglesia
                </label>
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  placeholder="Iglesia de Santidad Central"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Descripción <span className="text-neutral-300">(opcional)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  rows={3}
                  placeholder="Horarios, pastor, referencias..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Zona
                </label>
                <select
                  value={form.zona_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, zona_id: e.target.value }))
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="" disabled>
                    Selecciona una zona
                  </option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* A: buscar dirección */}
              <div className="relative">
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Buscar dirección o lugar
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Icon name="search" size={16} />
                  </span>
                  <input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    placeholder="Ej. Tegucigalpa, hospital, parque..."
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                {(geo.results.length > 0 || geo.loading) && addressQuery && (
                  <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                    {geo.loading && geo.results.length === 0 && (
                      <li className="px-3 py-2.5 text-sm text-neutral-400">
                        Buscando...
                      </li>
                    )}
                    {geo.results.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => selectResult(r)}
                          className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Icon name="pin" size={15} className="mt-0.5 shrink-0 text-neutral-400" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-neutral-700 dark:text-neutral-100">
                              {r.name}
                            </span>
                            {r.address && (
                              <span className="block truncate text-xs text-neutral-400">
                                {r.address}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* B y C: mapa y GPS */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={pickOnMap}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-200 py-2 text-xs font-medium text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <Icon name="crosshair" size={18} />
                  Elegir en el mapa
                </button>
                <button
                  type="button"
                  onClick={useGps}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-200 py-2 text-xs font-medium text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <Icon name="gps" size={18} />
                  Mi ubicación
                </button>
              </div>

              {/* Resultado: dirección + coordenadas */}
              {coords ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-500/10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <Icon name="check" size={14} /> Ubicación seleccionada
                  </div>
                  <p className="mt-1.5 text-sm text-neutral-700 dark:text-neutral-100">
                    {addressLoading
                      ? "Obteniendo dirección..."
                      : address?.address || address?.name || "Ubicación sin dirección"}
                  </p>
                  {address?.context && (
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {[
                        address.context.city,
                        address.context.region,
                        address.context.country,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-400 dark:border-neutral-700">
                  Elige una ubicación por búsqueda, mapa o GPS.
                </div>
              )}

              {/* Avanzado: coordenadas manuales */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <Icon
                    name="chevronRight"
                    size={14}
                    className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                  />
                  Coordenadas (avanzado)
                </button>
                {showAdvanced && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={coords?.lat ?? ""}
                      onChange={(e) =>
                        setCoords((c) => ({
                          lat: parseFloat(e.target.value) || 0,
                          lng: c?.lng ?? 0,
                        }))
                      }
                      placeholder="Latitud"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 focus:border-emerald-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                    <input
                      value={coords?.lng ?? ""}
                      onChange={(e) =>
                        setCoords((c) => ({
                          lat: c?.lat ?? 0,
                          lng: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="Longitud"
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 focus:border-emerald-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie: navegación entre pasos */}
        <div className="flex gap-2 border-t border-neutral-100 p-4 pb-safe dark:border-neutral-800">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar <Icon name="chevronRight" size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <Icon name="back" size={16} /> Atrás
              </button>
              <button
                type="button"
                disabled={!canSave || saving}
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Guardando..." : mode === "add" ? "Crear iglesia" : "Guardar cambios"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
