import {
  TIMELINE_END,
  TIMELINE_START,
  type Efficiency,
} from '../types'

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isToday(dateKey: string): boolean {
  return dateKey === formatDateKey(new Date())
}

export function addDays(dateKey: string, delta: number): string {
  const d = parseDateKey(dateKey)
  d.setDate(d.getDate() + delta)
  return formatDateKey(d)
}

export function formatDateRange(startDate: string, endDate: string): string {
  return startDate === endDate ? startDate : `${startDate} 至 ${endDate}`
}

export function formatDateNav(dateKey: string): string {
  const d = parseDateKey(dateKey)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  const todayMark = isToday(dateKey) ? ' 今天' : ` 周${weekday}`
  return `${y}-${m}-${day}${todayMark}`
}

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function timeToMinutes(value: string): number | null {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return clampMinutes(h * 60 + m)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function snapMinutes(value: number, snap: number): number {
  return Math.round(value / snap) * snap
}

export function clampMinutes(m: number): number {
  return Math.max(TIMELINE_START, Math.min(TIMELINE_END, m))
}

export function yToMinutes(
  y: number,
  pxPerMinute: number,
  snap: number,
): number {
  const raw = TIMELINE_START + y / pxPerMinute
  return clampMinutes(snapMinutes(raw, snap))
}

export function minutesToY(m: number, pxPerMinute: number): number {
  return (m - TIMELINE_START) * pxPerMinute
}

export function timelineHeight(pxPerMinute: number): number {
  return (TIMELINE_END - TIMELINE_START) * pxPerMinute
}

export function getCurrentMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function nextEfficiency(current: Efficiency): Efficiency {
  const order: Efficiency[] = ['none', 'high', 'medium', 'low']
  const idx = order.indexOf(current)
  return order[(idx + 1) % order.length]
}

export function calcStats(
  entries: { start_minutes: number; end_minutes: number; efficiency: Efficiency }[],
) {
  const totalWindow = TIMELINE_END - TIMELINE_START
  let recorded = 0
  const byEff: Record<Efficiency, number> = {
    none: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  for (const e of entries) {
    const dur = e.end_minutes - e.start_minutes
    recorded += dur
    byEff[e.efficiency] += dur
  }

  return {
    recorded,
    unrecorded: Math.max(0, totalWindow - recorded),
    byEff,
    count: entries.length,
  }
}
