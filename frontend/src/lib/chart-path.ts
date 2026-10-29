export interface ChartPoint {
  x: number
  y: number
}

// Cubic controls are clamped to each segment's range so smooth curves do not invent peaks.
export function smoothLinePath(points: ChartPoint[]): string {
  if (!points.length) return ''
  const number = (value: number) => Number(value.toFixed(2))
  const clamp = (value: number, a: number, b: number) =>
    Math.max(Math.min(a, b), Math.min(Math.max(a, b), value))
  let path = `M ${number(points[0].x)} ${number(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)],
      p1 = points[i],
      p2 = points[i + 1],
      p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = {
      x: clamp(p1.x + (p2.x - p0.x) / 6, p1.x, p2.x),
      y: clamp(p1.y + (p2.y - p0.y) / 6, p1.y, p2.y),
    }
    const c2 = {
      x: clamp(p2.x - (p3.x - p1.x) / 6, p1.x, p2.x),
      y: clamp(p2.y - (p3.y - p1.y) / 6, p1.y, p2.y),
    }
    path += ` C ${number(c1.x)} ${number(c1.y)}, ${number(c2.x)} ${number(c2.y)}, ${number(p2.x)} ${number(p2.y)}`
  }
  return path
}
