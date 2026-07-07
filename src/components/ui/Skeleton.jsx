// Bloque de carga con efecto shimmer (clases definidas en index.css).
export default function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

// Skeleton con la forma de una tarjeta de iglesia, para la lista en carga.
export function ChurchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3.5">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <Skeleton className="mt-3 h-3 w-full" />
    </div>
  );
}
