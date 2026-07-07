import { useEffect, useRef } from "react";

// Llama a `handler` cuando se hace click/touch fuera del elemento referenciado.
// Solo está activo mientras `active` sea true (para menús/popovers abiertos).
export function useClickOutside(handler, active = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler(e);
    };
    const onKey = (e) => {
      if (e.key === "Escape") handler(e);
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [handler, active]);

  return ref;
}
