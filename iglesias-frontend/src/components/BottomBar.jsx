import { totalDistance } from '../utils/haversine'

export default function BottomBar({ iglesias, selected, onClear }) {
  const selectedIgs = selected
    .map(id => iglesias.find(i => i.id == id))
    .filter(Boolean)

  const dist = selectedIgs.length > 1 ? totalDistance(selectedIgs) : null

  return (
    <div className="h-14 bg-white border-t border-neutral-100 flex items-center px-6 gap-4">
      {dist !== null ? (
        <>
          <span className="text-sm text-neutral-400">
            Distancia total ({selectedIgs.length} iglesias):
          </span>
          <span className="text-sm font-semibold text-emerald-700">
            {dist.toFixed(2)} km
          </span>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-all"
          >
            Limpiar
          </button>
        </>
      ) : (
        <span className="text-xs text-neutral-400">
          {selected.length === 1
            ? 'Selecciona otra iglesia para calcular la distancia'
            : 'Selecciona 2 o más iglesias del panel para medir distancias'}
        </span>
      )}
    </div>
  )
}