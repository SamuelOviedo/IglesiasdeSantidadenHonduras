import Icon from "./ui/Icon";
import { useClickOutside } from "../hooks/useClickOutside";

// Menú contextual del mapa (click derecho en escritorio).
export default function MapContextMenu({ x, y, items, onClose }) {
  const ref = useClickOutside(onClose, true);
  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
      className="absolute z-40 min-w-[200px] -translate-x-1 -translate-y-1 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 shadow-xl shadow-black/20 dark:border-neutral-700 dark:bg-neutral-800 animate-scale-in origin-top-left"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            onClose();
            item.onClick?.();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <Icon name={item.icon} size={16} className="text-neutral-400" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
