import { useState, useCallback } from "react";

// Encapsula la geolocalización del navegador.
// request() devuelve una promesa con { lat, lng } o rechaza con el error.
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          const err = new Error("Geolocalización no soportada");
          setError(err);
          reject(err);
          return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setLocation(loc);
            setError(null);
            setLoading(false);
            resolve(loc);
          },
          (err) => {
            setError(err);
            setLoading(false);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }),
    [],
  );

  const clear = useCallback(() => setLocation(null), []);

  return { location, loading, error, request, clear };
}
