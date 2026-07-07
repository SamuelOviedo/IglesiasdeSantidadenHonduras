// Contenedor del panel para escritorio. El contenido se pasa como children
// (normalmente <PanelContent />) para compartirlo con el bottom sheet móvil.
export default function Sidebar({ children }) {
  return (
    <aside className="z-20 hidden w-[360px] shrink-0 flex-col border-r border-neutral-100 bg-white shadow-xl shadow-black/5 dark:border-neutral-800 dark:bg-neutral-900 md:flex">
      {children}
    </aside>
  );
}
