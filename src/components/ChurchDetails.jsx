import Icon from "./ui/Icon";

function ActionButton({ icon, label, onClick, variant = "ghost", active }) {
  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
    ghost:
      "border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
    danger:
      "border border-neutral-200 text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-800/60 dark:hover:bg-red-500/10 dark:hover:text-red-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
        active
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-400"
          : styles[variant]
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

// Panel de información de lugar, al estilo de Google Maps.
export default function ChurchDetails({
  church,
  zoneName,
  selected,
  adminMode,
  onBack,
  onNavigate,
  onSetOrigin,
  onSetDestination,
  onEdit,
  onDelete,
}) {
  const isOrigin = selected?.origin === church.id;
  const isDestination = selected?.destination === church.id;

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="flex items-center gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la lista"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Icon name="back" size={18} />
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Detalles
        </span>
      </div>

      <div className="px-5 pb-2 pt-2">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Icon name="church" size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight text-neutral-800 dark:text-neutral-50">
              {church.nombre}
            </h2>
            {zoneName && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                <Icon name="layers" size={13} /> {zoneName}
              </p>
            )}
          </div>
        </div>

        {church.descripcion && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {church.descripcion}
          </p>
        )}

        {/* Acciones principales */}
        <div className="mt-4 flex gap-2">
          <ActionButton
            icon="navigation"
            label="Cómo llegar"
            variant="primary"
            onClick={onNavigate}
          />
          <ActionButton
            icon="origin"
            label={isOrigin ? "Origen ✓" : "Origen"}
            active={isOrigin}
            onClick={onSetOrigin}
          />
          <ActionButton
            icon="pin"
            label={isDestination ? "Destino ✓" : "Destino"}
            active={isDestination}
            onClick={onSetDestination}
          />
        </div>

        {adminMode && (
          <div className="mt-2 flex gap-2">
            <ActionButton icon="edit" label="Editar" onClick={onEdit} />
            <ActionButton
              icon="trash"
              label="Eliminar"
              variant="danger"
              onClick={onDelete}
            />
          </div>
        )}

        {/* Coordenadas (información avanzada, al final) */}
        <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            <Icon name="pin" size={12} /> Coordenadas
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-300">
            {parseFloat(church.lat).toFixed(6)},{" "}
            {parseFloat(church.lng).toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}
