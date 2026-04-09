import { totalDistance } from '../utils/haversine'

export default function BottomBar({ iglesias, selected, onClear }) {
  const selectedIgs = selected
    .map(id => iglesias.find(i => i.id == id))
    .filter(Boolean)

  const dist = selectedIgs.length > 1 ? totalDistance(selectedIgs) : null

  return (
    <div className="h-14 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center px-6 gap-4">
      {dist !== null ? (
        <>
          <span className="text-sm text-neutral-400 dark:text-neutral-500">
            Distancia total ({selectedIgs.length} iglesias):
          </span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {dist.toFixed(2)} km
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
          {selected.length === 1 ? (
            <>
              <span className="hidden sm:inline">Selecciona otra iglesia para calcular la distancia</span>
              <span className="sm:hidden">Selecciona otra iglesia</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Selecciona 2 o más iglesias del panel para medir distancias</span>
              <span className="sm:hidden">Selecciona 2+ iglesias para medir</span>
            </>
          )}
        </span>
      )}
    </div>
  )
}