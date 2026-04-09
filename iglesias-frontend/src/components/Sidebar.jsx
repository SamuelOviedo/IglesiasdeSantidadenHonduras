export default function Sidebar({
  zonas,
  activeZone,
  onZoneChange,
  iglesias,
  selected,
  onToggleMeasure,
  onAdd,
  onEdit,
  onDelete,
  loading,
}) {
  return (
    <aside className="w-72 h-full bg-white border-r border-neutral-100 flex flex-col">
      <div className="px-5 py-4 border-b border-neutral-100">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
          Iglesias Santidad
        </p>
        <p className="text-sm font-medium text-neutral-700 mt-0.5">Honduras</p>
      </div>

      {/* Zone switcher */}
      <div className="px-3 py-3 border-b border-neutral-100 flex flex-col gap-1">
        {zonas.map((z) => (
          <button
            key={z.id}
            onClick={() => onZoneChange(z.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeZone === z.id
                ? "bg-emerald-50 text-emerald-700"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {z.nombre}
          </button>
        ))}
      </div>

      {/* Church list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {loading ? (
          <p className="text-xs text-neutral-400 text-center mt-8">
            Cargando...
          </p>
        ) : iglesias.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center mt-8">
            No hay iglesias en esta zona
          </p>
        ) : (
          iglesias.map((ig) => (
            <div
              key={ig.id}
              className={`rounded-xl border p-3 transition-all ${
                selected.includes(ig.id)
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-neutral-100 bg-white hover:border-neutral-200"
              }`}
            >
              <p className="text-sm font-medium text-neutral-800">
                {ig.nombre}
              </p>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {parseFloat(ig.lat).toFixed(4)}, {parseFloat(ig.lng).toFixed(4)}
              </p>
              {ig.descripcion && (
                <p className="text-xs text-neutral-400 mt-1">
                  {ig.descripcion}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onToggleMeasure(ig.id)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    selected.includes(ig.id)
                      ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                      : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  {selected.includes(ig.id) ? "✓ Selec." : "Medir"}
                </button>
                <button
                  onClick={() => onEdit(ig)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(ig.id)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 text-neutral-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAdd}
        className="mx-3 mb-3 py-2.5 rounded-xl border border-dashed border-neutral-200 text-sm text-neutral-400 hover:bg-neutral-50 transition-all"
      >
        + Agregar iglesia
      </button>
    </aside>
  );
}
