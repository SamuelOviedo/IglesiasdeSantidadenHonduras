import Icon from "./ui/Icon";

// Campo de búsqueda reutilizable con icono y botón de limpiar.
export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onFocus,
  autoFocus = false,
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
        <Icon name="search" size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-10 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
