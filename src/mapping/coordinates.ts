/**
 * Geographic coordinate handling for tide pool mapping.
 * Provides tools for working with latitude/longitude
 * positions, coordinate formatting, and distance calculations
 * between monitoring stations and survey sites.
 */

export interface Coordinate {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation: number;
}

export interface BoundingBox {
  readonly north: number;
  readonly south: number;
  readonly east: number;
  readonly west: number;
}

export interface NamedLocation {
  readonly name: string;
  readonly coordinate: Coordinate;
  readonly description: string;
}

export function createCoordinate(
  latitude: number,
  longitude: number,
  elevation: number = 0
): Coordinate {
  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }
  return { latitude, longitude, elevation };
}

export function formatDMS(decimal: number, isLatitude: boolean): string {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100;
  const dir = isLatitude
    ? decimal >= 0 ? "N" : "S"
    : decimal >= 0 ? "E" : "W";
  return `${degrees}\u00B0${minutes}'${seconds}"${dir}`;
}

export function formatCoordinate(coord: Coordinate): string {
  const lat = formatDMS(coord.latitude, true);
  const lon = formatDMS(coord.longitude, false);
  return `${lat} ${lon} (${coord.elevation}m)`;
}

export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function midpoint(a: Coordinate, b: Coordinate): Coordinate {
  return createCoordinate(
    (a.latitude + b.latitude) / 2,
    (a.longitude + b.longitude) / 2,
    (a.elevation + b.elevation) / 2
  );
}

export function boundingBoxFromPoints(coords: Coordinate[]): BoundingBox {
  if (coords.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }
  return {
    north: Math.max(...coords.map((c) => c.latitude)),
    south: Math.min(...coords.map((c) => c.latitude)),
    east: Math.max(...coords.map((c) => c.longitude)),
    west: Math.min(...coords.map((c) => c.longitude)),
  };
}

export function isWithinBounds(coord: Coordinate, bounds: BoundingBox): boolean {
  return (
    coord.latitude >= bounds.south &&
    coord.latitude <= bounds.north &&
    coord.longitude >= bounds.west &&
    coord.longitude <= bounds.east
  );
}

export function sortByDistance(
  origin: Coordinate,
  locations: NamedLocation[]
): NamedLocation[] {
  return [...locations].sort(
    (a, b) =>
      haversineDistance(origin, a.coordinate) -
      haversineDistance(origin, b.coordinate)
  );
}
