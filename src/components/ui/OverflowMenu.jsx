import { useState, useCallback } from "react";
import Icon from "./Icon";
import { useClickOutside } from "../../hooks/useClickOutside";

// Menú de tres puntos. items: [{ label, icon, onClick, danger }].
export default function OverflowMenu({
  items,
  align = "right",
  label = "Más opciones",
  triggerClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside(close, open);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={
          triggerClassName ||
          "flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-colors"
        }
      >
        <Icon name="more" size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-1 min-w-[190px] overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-black/40 animate-scale-in ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                close();
                item.onClick?.();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                item.danger
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
