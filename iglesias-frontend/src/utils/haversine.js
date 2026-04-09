export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r;
  const dLng = (lng2 - lng1) * d2r;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function totalDistance(iglesias) {
  let d = 0;
  for (let i = 0; i < iglesias.length - 1; i++) {
    d += haversine(
      iglesias[i].lat,
      iglesias[i].lng,
      iglesias[i + 1].lat,
      iglesias[i + 1].lng,
    );
  }
  return d;
}
