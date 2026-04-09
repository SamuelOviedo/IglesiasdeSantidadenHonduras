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
  const [modal, setModal] = useState(null); // null | 'add' | { type:'edit', iglesia }
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
    console.log("handleSave llamado", formData); // ← agrega esta línea
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
    <div className={`flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans${darkMode ? ' dark' : ''}`}>
      <Sidebar
        zonas={zonas}
        activeZone={activeZone}
        onZoneChange={setActiveZone}
        iglesias={iglesias}
        selected={selected}
        onToggleMeasure={toggleMeasure}
        onAdd={() => setModal("add")}
        onEdit={(ig) => setModal({ type: "edit", iglesia: ig })}
        onDelete={handleDelete}
        loading={loading}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
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
