import { useState } from "react";
import Icon from "./ui/Icon";
import OverflowMenu from "./ui/OverflowMenu";
import { useToast } from "../context/ToastContext";

// Interfaz dedicada de gestión de zonas: crear, renombrar, eliminar y
// elegir el centro directamente en el mapa. Muestra el nº de iglesias por zona.
export default function ZoneManager({
  zonas,
  counts,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  requestMapPick,
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(null); // id en edición | "new" | null
  const [form, setForm] = useState({ nombre: "", lat_centro: "", lng_centro: "" });
  const [busy, setBusy] = useState(false);

  const startNew = () => {
    setForm({ nombre: "", lat_centro: "", lng_centro: "" });
    setEditing("new");
  };
  const startEdit = (z) => {
    setForm({
      nombre: z.nombre,
      lat_centro: z.lat_centro ?? "",
      lng_centro: z.lng_centro ?? "",
    });
    setEditing(z.id);
  };
  const cancel = () => setEditing(null);

  const pickCenter = async () => {
    const initial =
      form.lat_centro && form.lng_centro
        ? { lat: parseFloat(form.lat_centro), lng: parseFloat(form.lng_centro) }
        : null;
    const picked = await requestMapPick(initial);
    if (picked) {
      setForm((f) => ({
        ...f,
        lat_centro: picked.lat.toFixed(6),
        lng_centro: picked.lng.toFixed(6),
      }));
    }
  };

  const save = async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre de la zona es obligatorio");
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      lat_centro: form.lat_centro ? parseFloat(form.lat_centro) : null,
      lng_centro: form.lng_centro ? parseFloat(form.lng_centro) : null,
    };
    setBusy(true);
    try {
      if (editing === "new") {
        await onCreate(payload);
        toast.success("Zona creada");
      } else {
        await onUpdate(editing, payload);
        toast.success("Zona actualizada");
      }
      setEditing(null);
    } catch {
      toast.error("No se pudo guardar la zona");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async (z) => {
    const n = counts[z.id] ?? 0;
    if (
      !confirm(
        n > 0
          ? `“${z.nombre}” tiene ${n} iglesia(s). ¿Eliminar la zona de todas formas?`
          : `¿Eliminar la zona “${z.nombre}”?`,
      )
    )
      return;
    try {
      await onDelete(z.id);
      toast.success("Zona eliminada");
    } catch {
      toast.error("No se pudo eliminar la zona");
    }
  };

  const hasCenter = form.lat_centro !== "" && form.lng_centro !== "";

  return (
    <div className="fixed inset-0 z-[1001] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-3xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Icon name="layers" size={18} />
            </span>
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-50">
              Gestión de zonas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-4 py-3">
          {editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Nombre de la zona
                </label>
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  placeholder="Zona Central"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <button
                type="button"
                onClick={pickCenter}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-neutral-600 dark:text-neutral-300"
              >
                <Icon name="crosshair" size={16} />
                {hasCenter ? "Cambiar centro en el mapa" : "Elegir centro en el mapa"}
              </button>

              {hasCenter && (
                <p className="text-center font-mono text-xs text-neutral-400">
                  {form.lat_centro}, {form.lng_centro}
                </p>
              )}

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={cancel}
                  className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busy ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {zonas.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-400">
                  Aún no hay zonas. Crea la primera.
                </p>
              )}
              {zonas.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-700/60 dark:text-neutral-300">
                    <Icon name="layers" size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {z.nombre}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {counts[z.id] ?? 0} iglesia(s)
                    </p>
                  </div>
                  <OverflowMenu
                    items={[
                      { label: "Renombrar / centro", icon: "edit", onClick: () => startEdit(z) },
                      { label: "Eliminar", icon: "trash", danger: true, onClick: () => confirmDelete(z) },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!editing && (
          <div className="border-t border-neutral-100 p-3 pb-safe dark:border-neutral-800">
            <button
              type="button"
              onClick={startNew}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Icon name="plus" size={18} />
              Nueva zona
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
