// Haversine great-circle distance in METERS between two { latitude, longitude } points
export function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
