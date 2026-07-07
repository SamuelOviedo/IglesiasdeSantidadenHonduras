import { useState, useEffect, useCallback } from "react";
import * as api from "../utils/api";

// Estado central de datos: zonas, zona activa, iglesias de la zona, conteos,
// y las operaciones CRUD. Envuelve utils/api y recarga tras cada mutación.
export function useChurchData() {
  const [zonas, setZonas] = useState([]);
  const [zonasLoading, setZonasLoading] = useState(true);
  const [activeZone, setActiveZone] = useState(null);
  const [iglesias, setIglesias] = useState([]);
  const [iglesiasLoading, setIglesiasLoading] = useState(false);
  const [counts, setCounts] = useState({});

  const loadCounts = useCallback(async () => {
    try {
      setCounts(await api.getChurchCounts());
    } catch {
      /* conteos son informativos: ignoramos fallos */
    }
  }, []);

  const loadZonas = useCallback(async () => {
    setZonasLoading(true);
    try {
      const data = await api.getZonas();
      setZonas(data);
      setActiveZone((prev) => prev ?? data[0]?.id ?? null);
      return data;
    } finally {
      setZonasLoading(false);
    }
  }, []);

  const loadIglesias = useCallback(async (zoneId) => {
    if (!zoneId) {
      setIglesias([]);
      return [];
    }
    setIglesiasLoading(true);
    try {
      const data = await api.getIglesias(zoneId);
      setIglesias(data);
      return data;
    } finally {
      setIglesiasLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZonas();
    loadCounts();
  }, [loadZonas, loadCounts]);

  useEffect(() => {
    loadIglesias(activeZone);
  }, [activeZone, loadIglesias]);

  /* --------------------------- CRUD iglesias --------------------------- */

  const addChurch = useCallback(
    async (form) => {
      const created = await api.createIglesia(form);
      if (form.zona_id === activeZone) await loadIglesias(activeZone);
      loadCounts();
      return created;
    },
    [activeZone, loadIglesias, loadCounts],
  );

  const editChurch = useCallback(
    async (id, form) => {
      await api.updateIglesia(id, form);
      await loadIglesias(activeZone);
    },
    [activeZone, loadIglesias],
  );

  const removeChurch = useCallback(
    async (id) => {
      await api.deleteIglesia(id);
      setIglesias((prev) => prev.filter((i) => i.id !== id));
      loadCounts();
    },
    [loadCounts],
  );

  /* ----------------------------- CRUD zonas ---------------------------- */

  const addZone = useCallback(
    async (form) => {
      const created = await api.createZona(form);
      await loadZonas();
      return created;
    },
    [loadZonas],
  );

  const editZone = useCallback(
    async (id, form) => {
      await api.updateZona(id, form);
      await loadZonas();
    },
    [loadZonas],
  );

  const removeZone = useCallback(
    async (id) => {
      await api.deleteZona(id);
      setActiveZone((prev) => (prev === id ? null : prev));
      await loadZonas();
      loadCounts();
    },
    [loadZonas, loadCounts],
  );

  return {
    zonas,
    zonasLoading,
    activeZone,
    setActiveZone,
    iglesias,
    iglesiasLoading,
    counts,
    reloadCounts: loadCounts,
    addChurch,
    editChurch,
    removeChurch,
    addZone,
    editZone,
    removeZone,
  };
}
