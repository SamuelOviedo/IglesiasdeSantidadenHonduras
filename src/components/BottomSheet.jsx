import { useState, useRef, useEffect } from "react";

const SNAP_FRACTIONS = [0.16, 0.5, 0.92]; // colapsado, medio, expandido

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const nearest = (value, points) =>
  points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));

// Bottom sheet arrastrable estilo Google Maps con tres puntos de anclaje.
// El mapa permanece siempre visible detrás.
export default function BottomSheet({ children }) {
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const snaps = SNAP_FRACTIONS.map((f) => Math.round(vh * f));
  const [height, setHeight] = useState(() => Math.round(vh * SNAP_FRACTIONS[1]));
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setHeight((h) => clamp(h, snaps[0], snaps[snaps.length - 1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh]);

  const onPointerDown = (e) => {
    dragRef.current = { startY: e.clientY, startH: height };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const delta = dragRef.current.startY - e.clientY;
    setHeight(
      clamp(dragRef.current.startH + delta, snaps[0], snaps[snaps.length - 1]),
    );
  };
  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setHeight((h) => nearest(h, snaps));
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-neutral-100 bg-white shadow-2xl shadow-black/20 dark:border-neutral-800 dark:bg-neutral-900 md:hidden"
      style={{
        height,
        transition: dragging
          ? "none"
          : "height 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex shrink-0 cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
        aria-label="Arrastra para expandir o contraer"
        role="separator"
      >
        <span className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
