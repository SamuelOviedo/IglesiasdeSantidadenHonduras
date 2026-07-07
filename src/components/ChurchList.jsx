import Icon from "./ui/Icon";
import { ChurchCardSkeleton } from "./ui/Skeleton";
import ChurchCard from "./ChurchCard";

function EmptyState({ icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        <Icon name={icon} size={26} />
      </span>
      <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {title}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ChurchList({
  churches,
  loading,
  query,
  subtitleFor,
  selected,
  adminMode,
  onSelect,
  onSetOrigin,
  onSetDestination,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 px-3 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ChurchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (churches.length === 0) {
    return query ? (
      <EmptyState
        icon="search"
        title="Sin resultados"
        hint={`No encontramos iglesias para “${query}”.`}
      />
    ) : (
      <EmptyState
        icon="church"
        title="No hay iglesias en esta zona"
        hint="Activa el modo administración para agregar la primera."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-3 py-2">
      {churches.map((church) => (
        <ChurchCard
          key={church.id}
          church={church}
          subtitle={subtitleFor?.(church)}
          isSelected={selected?.detailId === church.id}
          isOrigin={selected?.origin === church.id}
          isDestination={selected?.destination === church.id}
          adminMode={adminMode}
          onClick={() => onSelect(church)}
          onSetOrigin={() => onSetOrigin(church.id)}
          onSetDestination={() => onSetDestination(church.id)}
          onEdit={() => onEdit(church)}
          onDelete={() => onDelete(church)}
        />
      ))}
    </div>
  );
}
