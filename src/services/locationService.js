import * as Location from 'expo-location';

// Default Target Location (Can be overridden in .env)
// EXPO_PUBLIC_ALLOWED_LAT & EXPO_PUBLIC_ALLOWED_LNG
export const TARGET_LATITUDE = parseFloat(process.env.EXPO_PUBLIC_ALLOWED_LAT || '30.9544959'); 
export const TARGET_LONGITUDE = parseFloat(process.env.EXPO_PUBLIC_ALLOWED_LNG || '75.8577284');
export const ALLOWED_RADIUS_METERS = parseFloat(process.env.EXPO_PUBLIC_ALLOWED_RADIUS_METERS || '2500');

/**
 * Calculates distance between two GPS points in meters using the Haversine formula
 */
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Verifies if device's current location is within the allowed geofence radius
 */
export async function verifyLocationWithinGeofence(
  targetLat = TARGET_LATITUDE,
  targetLng = TARGET_LONGITUDE,
  maxRadius = ALLOWED_RADIUS_METERS
) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        isWithinFence: false,
        distanceMeters: null,
        error: 'Location permission was denied. Please enable location services to log in.',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    if (!location || !location.coords) {
      return {
        isWithinFence: false,
        distanceMeters: null,
        error: 'Unable to retrieve GPS location. Please ensure location services / GPS is enabled.',
      };
    }

    const { latitude, longitude } = location.coords;
    const distanceMeters = getDistanceInMeters(latitude, longitude, targetLat, targetLng);

    return {
      isWithinFence: distanceMeters <= maxRadius,
      distanceMeters,
      currentCoords: { latitude, longitude },
      targetCoords: { latitude: targetLat, longitude: targetLng },
      allowedRadiusMeters: maxRadius,
      error: null,
    };
  } catch (err) {
    return {
      isWithinFence: false,
      distanceMeters: null,
      error: err.message || 'Error obtaining device location.',
    };
  }
}
