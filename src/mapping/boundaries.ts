/**
 * Boundary management for tide pool study areas.
 * Defines geographic boundaries for monitoring regions,
 * protected areas, and survey transect lines used in
 * intertidal field studies.
 */

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface Boundary {
  readonly id: string;
  readonly name: string;
  readonly vertices: Point2D[];
  readonly areaSquareMeters: number;
  readonly createdAt: Date;
}

export interface Transect {
  readonly id: string;
  readonly name: string;
  readonly start: Point2D;
  readonly end: Point2D;
  readonly lengthMeters: number;
  readonly bearing: number;
}

export function distance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function perimeterLength(vertices: Point2D[]): number {
  if (vertices.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < vertices.length; i++) {
    const next = (i + 1) % vertices.length;
    total += distance2D(vertices[i], vertices[next]);
  }
  return Math.round(total * 100) / 100;
}

export function polygonArea(vertices: Point2D[]): number {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.round((Math.abs(area) / 2) * 100) / 100;
}

export function createBoundary(name: string, vertices: Point2D[]): Boundary {
  return {
    id: `bnd_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
    name,
    vertices: [...vertices],
    areaSquareMeters: polygonArea(vertices),
    createdAt: new Date(),
  };
}

export function centroid(vertices: Point2D[]): Point2D {
  if (vertices.length === 0) return { x: 0, y: 0 };
  const sumX = vertices.reduce((s, v) => s + v.x, 0);
  const sumY = vertices.reduce((s, v) => s + v.y, 0);
  return {
    x: Math.round((sumX / vertices.length) * 100) / 100,
    y: Math.round((sumY / vertices.length) * 100) / 100,
  };
}

export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function createTransect(
  name: string,
  start: Point2D,
  end: Point2D
): Transect {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bearing = Math.round(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360 * 10) / 10;
  return {
    id: `trn_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
    name,
    start,
    end,
    lengthMeters: Math.round(distance2D(start, end) * 100) / 100,
    bearing,
  };
}

export function subdivideTransect(transect: Transect, segments: number): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push({
      x: Math.round((transect.start.x + t * (transect.end.x - transect.start.x)) * 100) / 100,
      y: Math.round((transect.start.y + t * (transect.end.y - transect.start.y)) * 100) / 100,
    });
  }
  return points;
}

export function boundaryContainsSite(boundary: Boundary, site: Point2D): boolean {
  return isPointInPolygon(site, boundary.vertices);
}
