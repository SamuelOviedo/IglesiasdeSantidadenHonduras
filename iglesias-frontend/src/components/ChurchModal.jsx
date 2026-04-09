import { useState, useEffect } from "react";

export default function ChurchModal({ mode, iglesia, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre: "",
    lat: "",
    lng: "",
    descripcion: "",
  });

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
    console.log("handleSubmit llamado", form); // ← agrega esta línea
    if (!form.nombre || !form.lat || !form.lng) {
      console.log("Validación falló", form); // ← y esta
      return;
    }
    onSave({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) });
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-1001 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <h3 className="text-sm font-semibold text-neutral-800 mb-4">
          {mode === "add" ? "Nueva iglesia" : "Editar iglesia"}
        </h3>

        {[
          {
            label: "Nombre",
            key: "nombre",
            placeholder: "Iglesia El Calvario",
          },
          { label: "Latitud", key: "lat", placeholder: "14.4505" },
          { label: "Longitud", key: "lng", placeholder: "-87.6321" },
        ].map((f) => (
          <div key={f.key} className="mb-3">
            <label className="block text-xs text-neutral-500 mb-1">
              {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [f.key]: e.target.value }))
              }
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:border-emerald-400"
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-xs text-neutral-500 mb-1">
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) =>
              setForm((p) => ({ ...p, descripcion: e.target.value }))
            }
            placeholder="Opcional..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-500 hover:bg-neutral-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
