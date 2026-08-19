/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
    const EARTH_RADIUS_KM = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 * Examples: "0.5 km away", "3.4 km away", "850 m away"
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        const meters = Math.round(km * 1000);
        return meters < 100 ? `${km.toFixed(1)} km away` : `${km.toFixed(1)} km away`;
    }
    return `${km.toFixed(1)} km away`;
}
