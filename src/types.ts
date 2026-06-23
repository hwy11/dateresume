export type Efficiency = 'none' | 'high' | 'medium' | 'low'

export interface TimeEntry {
  id: string
  user_id: string
  entry_date: string
  start_minutes: number
  end_minutes: number
  title: string
  notes: string | null
  efficiency: Efficiency
  created_at: string
  updated_at: string
}

export interface DraftEntry {
  start_minutes: number
  end_minutes: number
  title: string
  notes: string
}

/** 时间轴缩放档位：数值越大，纵向越拉伸、拖拽吸附越细 */
export interface ZoomLevel {
  id: string
  label: string
  scale: number
  snapMinutes: number
  minorLineMinutes: number
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { id: 'compact', label: '概览', scale: 0.65, snapMinutes: 60, minorLineMinutes: 60 },
  { id: 'normal', label: '30分', scale: 1, snapMinutes: 30, minorLineMinutes: 30 },
  { id: 'fine', label: '15分', scale: 1.6, snapMinutes: 15, minorLineMinutes: 15 },
  { id: 'detail', label: '5分', scale: 2.5, snapMinutes: 5, minorLineMinutes: 5 },
]

export const TIMELINE_START = 6 * 60
export const TIMELINE_END = 24 * 60
export const BASE_PX_PER_MINUTE = 1.2

export const EFFICIENCY_ORDER: Efficiency[] = ['none', 'high', 'medium', 'low']

export const EFFICIENCY_LABELS: Record<Efficiency, string> = {
  none: '未标',
  high: '高效',
  medium: '中效',
  low: '低效',
}

export const EFFICIENCY_COLORS: Record<Efficiency, string> = {
  none: '#9CA3AF',
  high: '#22C55E',
  medium: '#EAB308',
  low: '#F97316',
}

export const EFFICIENCY_BG: Record<Efficiency, string> = {
  none: '#F9FAFB',
  high: '#F0FDF4',
  medium: '#FEFCE8',
  low: '#FFF7ED',
}
