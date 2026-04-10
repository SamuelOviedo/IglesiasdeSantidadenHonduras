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
  const [selected, setSelected] = useState({ origin: null, destination: null });
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
    setSelected({ origin: null, destination: null });
    setLoading(true);
    getIglesias(activeZone).then((data) => {
      setIglesias(data);
      setLoading(false);
    });
  }, [activeZone]);

  function setDestination(id) {
    setSelected((prev) => ({
      ...prev,
      destination: prev.destination === id ? null : id,
    }));
  }

  function setOrigin(id) {
    setSelected((prev) => ({
      ...prev,
      origin: prev.origin === id ? null : id,
    }));
  }

  async function handleSave(formData) {
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
    setSelected((prev) => ({
      ...prev,
      origin: prev.origin === id ? null : prev.origin,
      destination: prev.destination === id ? null : prev.destination,
    }));
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans ${darkMode ? "dark" : ""}`}
    >
      {/* Botón Hamburguesa (Solo Móvil) */}
      <button
        className="absolute top-3 left-3 md:hidden bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-md text-neutral-600 dark:text-neutral-300 transition-all active:scale-95"
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

      {/* Fondo oscuro / Backdrop — siempre renderizado, animado con opacidad */}
      <div
        className={`fixed inset-0 bg-black/40 md:hidden transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 9998 }}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        zonas={zonas}
        activeZone={activeZone}
        onZoneChange={(id) => {
          setActiveZone(id);
          setSidebarOpen(false);
        }}
        iglesias={iglesias}
        selected={selected}
        onSetDestination={setDestination}
        onSetOrigin={setOrigin}
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

      {/* Contenedor Principal */}
      <div className="flex-1 relative flex flex-col h-full w-full min-w-0">
        <MapView
          iglesias={iglesias}
          selected={selected}
          activeZone={activeZone}
          zonas={zonas}
          darkMode={darkMode}
          onSetDestination={setDestination}
        />

        <BottomBar
          iglesias={iglesias}
          selected={selected.destination}
          onClear={() =>
            setSelected((prev) => ({ ...prev, destination: null }))
          }
        />
      </div>

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
