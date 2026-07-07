import Icon from "./ui/Icon";
import SearchBar from "./SearchBar";
import ZoneSelector from "./ZoneSelector";
import ChurchList from "./ChurchList";
import ChurchDetails from "./ChurchDetails";

// Cuerpo compartido del panel lateral (escritorio) y del bottom sheet (móvil).
export default function PanelContent({
  showBrand = true,
  // datos
  zonas,
  activeZone,
  counts,
  churches,
  loading,
  query,
  setQuery,
  selected,
  detailChurch,
  zoneName,
  subtitleFor,
  // modos
  adminMode,
  onToggleAdmin,
  darkMode,
  onToggleDark,
  // gps
  gpsActive,
  gpsLoading,
  onToggleGps,
  // acciones
  onZoneChange,
  onManageZones,
  onSelectChurch,
  onCloseDetails,
  onSetOrigin,
  onSetDestination,
  onNavigate,
  onEdit,
  onDelete,
  onAddChurch,
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Cabecera */}
      {showBrand && (
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
              Iglesias de Santidad
            </p>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
              Honduras
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleDark}
              title={darkMode ? "Modo día" : "Modo noche"}
              aria-label={darkMode ? "Activar modo día" : "Activar modo noche"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <Icon name={darkMode ? "sun" : "moon"} size={17} />
            </button>
            <button
              type="button"
              onClick={onToggleAdmin}
              title="Modo administración"
              aria-pressed={adminMode}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                adminMode
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                  : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon name="shield" size={15} />
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Controles fijos: búsqueda, GPS, zona */}
      <div className="flex flex-col gap-2.5 px-4 pb-3 pt-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar iglesia por nombre o descripción"
        />

        <button
          type="button"
          onClick={onToggleGps}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors ${
            gpsActive
              ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/10 dark:text-blue-400"
              : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          <Icon name="gps" size={16} />
          {gpsLoading
            ? "Ubicando..."
            : gpsActive
              ? "Usando mi ubicación"
              : "Usar mi ubicación actual"}
        </button>

        <ZoneSelector
          zonas={zonas}
          activeZone={activeZone}
          counts={counts}
          onChange={onZoneChange}
          adminMode={adminMode}
          onManage={onManageZones}
        />
      </div>

      {/* Lista o detalles (scroll) */}
      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin border-t border-neutral-100 dark:border-neutral-800">
        {detailChurch ? (
          <ChurchDetails
            church={detailChurch}
            zoneName={zoneName}
            selected={selected}
            adminMode={adminMode}
            onBack={onCloseDetails}
            onNavigate={() => onNavigate(detailChurch)}
            onSetOrigin={() => onSetOrigin(detailChurch.id)}
            onSetDestination={() => onSetDestination(detailChurch.id)}
            onEdit={() => onEdit(detailChurch)}
            onDelete={() => onDelete(detailChurch)}
          />
        ) : (
          <ChurchList
            churches={churches}
            loading={loading}
            query={query}
            subtitleFor={subtitleFor}
            selected={selected}
            adminMode={adminMode}
            onSelect={onSelectChurch}
            onSetOrigin={onSetOrigin}
            onSetDestination={onSetDestination}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Agregar (solo admin y sin panel de detalles abierto) */}
      {adminMode && !detailChurch && (
        <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={onAddChurch}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
          >
            <Icon name="plus" size={18} />
            Agregar iglesia
          </button>
        </div>
      )}
    </div>
  );
}
