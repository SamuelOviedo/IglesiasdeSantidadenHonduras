export default function BottomBar({ iglesias, selected, onClear }) {
  const selectedIg = selected ? iglesias.find((i) => i.id === selected) : null;

  return (
    <div className="h-14 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center px-6 gap-4">
      {selectedIg ? (
        <>
          <span className="text-sm text-neutral-400 dark:text-neutral-500">
            Iglesia seleccionada:
          </span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {selectedIg.nombre}
          </span>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            Limpiar
          </button>
        </>
      ) : (
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Selecciona una iglesia para ver la ruta desde tu ubicación
        </span>
      )}
    </div>
  );
}
