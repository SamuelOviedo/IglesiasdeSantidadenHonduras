import { useState, useCallback } from "react";
import Icon from "./ui/Icon";
import { useClickOutside } from "../hooks/useClickOutside";

// Selector de zona como dropdown moderno (reemplaza la lista larga de botones).
export default function ZoneSelector({
  zonas,
  activeZone,
  counts = {},
  onChange,
  adminMode = false,
  onManage,
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside(close, open);
  const active = zonas.find((z) => z.id === activeZone);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Icon name="layers" size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Zona
            </span>
            <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {active ? active.nombre : "Selecciona una zona"}
            </span>
          </span>
          <Icon
            name="chevronDown"
            size={16}
            className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {adminMode && (
          <button
            type="button"
            onClick={onManage}
            title="Gestionar zonas"
            aria-label="Gestionar zonas"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <Icon name="edit" size={16} />
          </button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto scroll-thin rounded-xl border border-neutral-100 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-black/40 animate-scale-in origin-top"
        >
          {zonas.length === 0 && (
            <li className="px-3 py-2 text-sm text-neutral-400">
              No hay zonas
            </li>
          )}
          {zonas.map((z) => {
            const selected = z.id === activeZone;
            return (
              <li key={z.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(z.id);
                    close();
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  <span className="flex-1 truncate">{z.nombre}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      selected
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                    }`}
                  >
                    {counts[z.id] ?? 0}
                  </span>
                  {selected && <Icon name="check" size={15} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
