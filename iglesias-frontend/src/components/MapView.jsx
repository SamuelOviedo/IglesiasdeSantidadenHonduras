import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export default function MapView({ iglesias, selected, zonas, activeZone, darkMode }) {
  const mapRef = useRef(null)
  const leafRef = useRef(null)
  const markersRef = useRef([])
  const polyRef = useRef(null)
  const tileRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (leafRef.current) return
    leafRef.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([14.45, -87.63], 10)

    tileRef.current = L.tileLayer(TILE_LIGHT, { maxZoom: 19 }).addTo(leafRef.current)
  }, [])

  // Switch tile layer when dark mode changes
  useEffect(() => {
    if (!leafRef.current || !tileRef.current) return
    tileRef.current.remove()
    tileRef.current = L.tileLayer(darkMode ? TILE_DARK : TILE_LIGHT, { maxZoom: 19 }).addTo(leafRef.current)
  }, [darkMode])

  // Fly to zone center when zone changes
  useEffect(() => {
    const map = leafRef.current
    if (!map || !activeZone) return
    const zona = zonas.find(z => z.id === activeZone)
    if (zona) map.flyTo([zona.lat_centro, zona.lng_centro], 12, { duration: 0.8 })
  }, [activeZone, zonas])

  // Render markers and polyline
  useEffect(() => {
    const map = leafRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (polyRef.current) { polyRef.current.remove(); polyRef.current = null }

    iglesias.forEach(ig => {
      const isSel = selected.includes(ig.id)
      const icon = L.divIcon({
        html: `<div style="
          width:${isSel ? 16 : 12}px;
          height:${isSel ? 16 : 12}px;
          border-radius:50%;
          background:${isSel ? '#10b981' : '#3b82f6'};
          border:2px solid ${isSel ? '#059669' : '#2563eb'};
          box-shadow:0 1px 4px rgba(0,0,0,.2)
        "></div>`,
        className: '',
        iconAnchor: [8, 8],
      })

      const marker = L.marker([ig.lat, ig.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <b style="font-size:13px;font-family:sans-serif">${ig.nombre}</b><br/>
          <span style="font-size:11px;color:#888;font-family:monospace">
            ${parseFloat(ig.lat).toFixed(4)}, ${parseFloat(ig.lng).toFixed(4)}
          </span>
          ${ig.descripcion ? `<br/><span style="font-size:11px">${ig.descripcion}</span>` : ''}
        `)

      markersRef.current.push(marker)
    })

    if (selected.length > 1) {
      const coords = selected
        .map(id => iglesias.find(i => i.id == id))
        .filter(Boolean)
        .map(ig => [ig.lat, ig.lng])

      polyRef.current = L.polyline(coords, {
        color: '#10b981',
        weight: 2,
        dashArray: '6,4',
        opacity: 0.8,
      }).addTo(map)
    }
  }, [iglesias, selected])

  return <div ref={mapRef} className="flex-1 w-full" />
}
