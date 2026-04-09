import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import BottomBar from "./components/BottomBar";
import ChurchModal from "./components/ChurchModal";
import {
  getZonas,
  getIglesias,
  createIglesia,
  updateIglesia,
  deleteIglesia,
} from "./utils/api";

export default function App() {
  const [zonas, setZonas] = useState([]);
  const [activeZone, setActiveZone] = useState(null);
  const [iglesias, setIglesias] = useState([]);
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getZonas().then((data) => {
      setZonas(data);
      if (data.length > 0) setActiveZone(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeZone) return;
    setSelected([]);
    setLoading(true);
    getIglesias(activeZone).then((data) => {
      setIglesias(data);
      setLoading(false);
    });
  }, [activeZone]);

  function toggleMeasure(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave(formData) {
    console.log("handleSave llamado", formData);
    if (modal === "add") {
      await createIglesia({ ...formData, zona_id: activeZone });
    } else {
      await updateIglesia(modal.iglesia.id, formData);
    }
    const data = await getIglesias(activeZone);
    setIglesias(data);
    setModal(null);
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta iglesia?")) return;
    await deleteIglesia(id);
    setIglesias((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans ${darkMode ? "dark" : ""}`}
    >
      {/* 1. Botón Hamburguesa (Solo Móvil) */}
      <button
        className="absolute top-3 left-3 md:hidden bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-md text-neutral-600 dark:text-neutral-300"
        style={{ zIndex: 1000 }}
        onClick={() => setSidebarOpen(true)}
        title="Abrir menú"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* 2. Fondo oscuro / Backdrop (Solo Móvil) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden transition-opacity"
          style={{ zIndex: 9998 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3. Componente Sidebar (Faltaba renderizarlo) */}
      {/* Dependiendo de cómo esté construido tu Sidebar, deberás pasarle el estado */}
      <Sidebar
        zonas={zonas}
        activeZone={activeZone}
        onZoneChange={(id) => {
          setActiveZone(id);
          setSidebarOpen(false);
        }}
        iglesias={iglesias}
        selected={selected}
        onToggleMeasure={toggleMeasure}
        onAdd={() => {
          setModal("add");
          setSidebarOpen(false);
        }}
        onEdit={(ig) => {
          setModal({ type: "edit", iglesia: ig });
          setSidebarOpen(false);
        }}
        onDelete={handleDelete}
        loading={loading}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 4. Contenedor Principal (Mapa y BottomBar) */}
      <div className="flex-1 relative flex flex-col h-full w-full">
        <MapView
          iglesias={iglesias}
          selected={selected}
          activeZone={activeZone}
          zonas={zonas}
          darkMode={darkMode}
        />

        <BottomBar
          iglesias={iglesias}
          selected={selected}
          onClear={() => setSelected([])}
        />
      </div>

      {/* 5. Modales (Fuera del flujo del layout principal) */}
      {modal && (
        <ChurchModal
          mode={modal === "add" ? "add" : "edit"}
          iglesia={modal?.iglesia}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
