import Icon from "./ui/Icon";
import OverflowMenu from "./ui/OverflowMenu";

// Tarjeta limpia de iglesia: nombre, subtítulo, preview de descripción y menú.
// Las acciones viven en el menú de tres puntos; nada de coordenadas por defecto.
export default function ChurchCard({
  church,
  subtitle,
  isSelected,
  isOrigin,
  isDestination,
  adminMode,
  onClick,
  onSetOrigin,
  onSetDestination,
  onEdit,
  onDelete,
}) {
  const items = [
    {
      label: isOrigin ? "Quitar origen" : "Marcar como origen",
      icon: "origin",
      onClick: onSetOrigin,
    },
    {
      label: isDestination ? "Quitar destino" : "Marcar como destino",
      icon: "pin",
      onClick: onSetDestination,
    },
  ];
  if (adminMode) {
    items.push(
      { label: "Editar", icon: "edit", onClick: onEdit },
      { label: "Eliminar", icon: "trash", onClick: onDelete, danger: true },
    );
  }

  const stateRing = isOrigin
    ? "border-blue-400 bg-blue-50/60 dark:border-blue-500/60 dark:bg-blue-500/10"
    : isDestination
      ? "border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/60 dark:bg-emerald-500/10"
      : isSelected
        ? "border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800"
        : "border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40 dark:hover:border-neutral-700";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-150 ${stateRing}`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-neutral-700/60 dark:text-neutral-300">
        <Icon name="church" size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {church.nombre}
          </p>
          {isOrigin && (
            <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              Origen
            </span>
          )}
          {isDestination && (
            <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              Destino
            </span>
          )}
        </div>
        {subtitle && (
          <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
            {subtitle}
          </p>
        )}
        {church.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
            {church.descripcion}
          </p>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <OverflowMenu items={items} />
      </div>
    </div>
  );
}
