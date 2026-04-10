export default function BottomBar({ iglesias, selected, onClear }) {
  const selectedIg = selected ? iglesias.find((i) => i.id === selected) : null;

  return (
    <div className="h-14 shrink-0 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center px-4 md:px-6 gap-3 min-w-0">
      {selectedIg ? (
        <div className="flex items-center gap-2 min-w-0 w-full animate-slide-up">
          <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
            Destino:
          </span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate min-w-0">
            {selectedIg.nombre}
          </span>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shrink-0 active:scale-95"
          >
            Limpiar
          </button>
        </div>
      ) : (
        <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
          Selecciona origen y destino para calcular una ruta
        </span>
      )}
    </div>
  );
}
