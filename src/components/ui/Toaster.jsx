import Icon from "./Icon";

const STYLES = {
  info: {
    icon: "info",
    accent: "text-blue-500",
    ring: "border-neutral-200 dark:border-neutral-700",
  },
  success: {
    icon: "check",
    accent: "text-emerald-500",
    ring: "border-emerald-200 dark:border-emerald-800/60",
  },
  error: {
    icon: "alert",
    accent: "text-red-500",
    ring: "border-red-200 dark:border-red-800/60",
  },
};

// Contenedor de notificaciones (renderizado por ToastProvider).
export default function Toaster({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[10000] flex flex-col items-center gap-2 px-4 pb-4 pb-safe"
      role="region"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const s = STYLES[t.type] ?? STYLES.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-white/95 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur dark:bg-neutral-800/95 dark:shadow-black/40 animate-toast-in ${s.ring}`}
          >
            <Icon name={s.icon} size={18} className={s.accent} />
            <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-100">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Cerrar notificación"
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
