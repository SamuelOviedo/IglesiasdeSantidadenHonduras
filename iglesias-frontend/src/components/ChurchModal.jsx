import { useState, useEffect } from "react";

export default function ChurchModal({ mode, iglesia, onSave, onClose }) {
  const [form, setForm] = useState({ nombre: "", lat: "", lng: "", descripcion: "" });

  useEffect(() => {
    if (mode === "edit" && iglesia) {
      setForm({
        nombre: iglesia.nombre,
        lat: iglesia.lat,
        lng: iglesia.lng,
        descripcion: iglesia.descripcion || "",
      });
    }
  }, [mode, iglesia]);

  function handleSubmit() {
    if (!form.nombre || !form.lat || !form.lng) return;
    onSave({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) });
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-1001 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scale-in">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
          {mode === "add" ? "Nueva iglesia" : "Editar iglesia"}
        </h3>

        {[
          { label: "Nombre", key: "nombre", placeholder: "Iglesia de Santidad (Nombre)" },
          { label: "Latitud", key: "lat", placeholder: "14.4505" },
          { label: "Longitud", key: "lng", placeholder: "-87.6321" },
        ].map((f) => (
          <div key={f.key} className="mb-3">
            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
            placeholder="Opcional..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
