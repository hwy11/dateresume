import {
  EFFICIENCY_LABELS,
  type TimeEntry,
} from '../types'
import { formatDateNav, formatDuration, minutesToTime } from './time'

export function entriesToMarkdown(dateKey: string, entries: TimeEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.start_minutes - b.start_minutes)
  const lines: string[] = [
    `# 时间复盘 ${formatDateNav(dateKey)}`,
    '',
    `> 共 ${sorted.length} 条记录`,
    '',
    '| 时段 | 时长 | 内容 | 效率 | 备注 |',
    '| --- | --- | --- | --- | --- |',
  ]

  for (const e of sorted) {
    const range = `${minutesToTime(e.start_minutes)}–${minutesToTime(e.end_minutes)}`
    const dur = formatDuration(e.end_minutes - e.start_minutes)
    const notes = e.notes?.trim() || '—'
    lines.push(
      `| ${range} | ${dur} | ${e.title || '（无标题）'} | ${EFFICIENCY_LABELS[e.efficiency]} | ${notes} |`,
    )
  }

  lines.push('')
  return lines.join('\n')
}

export function downloadMarkdown(content: string, dateKey: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `traceday-${dateKey}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyMarkdown(content: string) {
  await navigator.clipboard.writeText(content)
}
