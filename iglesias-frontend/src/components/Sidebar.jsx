export default function Sidebar({
  zonas,
  activeZone,
  onZoneChange,
  iglesias,
  selected,
  onSetDestination,
  onSetOrigin,
  onToggleUserLocation,
  onAdd,
  onEdit,
  onDelete,
  loading,
  darkMode,
  onToggleDark,
  isOpen,
  onClose,
}) {
  return (
    <aside
      className={`
      fixed left-0 top-0 h-full z-9999 w-[85vw] max-w-xs
      md:relative md:z-auto md:w-72 md:translate-x-0
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 shadow-2xl flex flex-col overflow-x-hidden
    `}
      style={{ zIndex: 9999 }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
            Iglesias Santidad
          </p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mt-0.5">
            Honduras
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDark}
            title={darkMode ? "Modo día" : "Modo noche"}
            className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            {darkMode ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            title="Cerrar"
            className="md:hidden p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* User location toggle */}
      <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={onToggleUserLocation}
          className={`w-full text-xs py-2 rounded-md border transition-all ${
            selected.useUserLocation
              ? "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
              : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          }`}
        >
          {selected.useUserLocation
            ? "✓ Usando mi ubicación"
            : "Usar mi ubicación actual"}
        </button>
      </div>

      {/* Zone switcher */}
      <div className="px-3 py-3 border-b border-neutral-100 dark:border-neutral-800 flex flex-col gap-1">
        {zonas.map((z) => (
          <button
            key={z.id}
            onClick={() => onZoneChange(z.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all truncate ${
              activeZone === z.id
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            {z.nombre}
          </button>
        ))}
      </div>

      {/* Church list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-y-4 w-full">
        {loading ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-8">
            Cargando...
          </p>
        ) : iglesias.length === 0 ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-8">
            No hay iglesias en esta zona
          </p>
        ) : (
          iglesias.map((ig) => (
            <div
              key={ig.id}
              className={`w-full rounded-xl border p-3 transition-all ${
                selected.origin === ig.id
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : selected.destination === ig.id
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-700"
              }`}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                {ig.nombre}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                {parseFloat(ig.lat).toFixed(4)}, {parseFloat(ig.lng).toFixed(4)}
              </p>
              {ig.descripcion && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  {ig.descripcion}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSetOrigin(ig.id)}
                  className={`text-xs px-2 py-1 rounded-md border transition-all ${
                    selected.origin === ig.id
                      ? "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {selected.origin === ig.id ? "✓ Origen" : "Origen"}
                </button>
                <button
                  onClick={() => onSetDestination(ig.id)}
                  className={`text-xs px-2 py-1 rounded-md border transition-all ${
                    selected.destination === ig.id
                      ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {selected.destination === ig.id ? "✓ Destino" : "Destino"}
                </button>
                <button
                  onClick={() => onEdit(ig)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(ig.id)}
                  className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all"
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
        className="mx-3 mb-3 py-2.5 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 text-sm text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
      >
        + Agregar iglesia
      </button>
    </aside>
  );
}
