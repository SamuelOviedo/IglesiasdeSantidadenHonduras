import { useState, useCallback, useRef } from "react";
import { forwardGeocode } from "../utils/geocoding";

// Búsqueda de direcciones/lugares con autocompletado y cancelación de peticiones.
export function useGeocoding(proximity) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  const search = useCallback(
    async (query) => {
      controllerRef.current?.abort();
      if (!query || query.trim().length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      try {
        const found = await forwardGeocode(query, {
          proximity,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResults(found);
      } catch (err) {
        if (err.name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [proximity],
  );

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setResults([]);
    setLoading(false);
  }, []);

  return { results, loading, search, clear };
}
