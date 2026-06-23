import {
  EFFICIENCY_LABELS,
  type TimeEntry,
} from '../types'
import { formatDateRange, formatDuration, minutesToTime } from './time'

export function entriesToMarkdown(
  startDate: string,
  endDate: string,
  entries: TimeEntry[],
): string {
  const sorted = [...entries].sort((a, b) =>
    a.entry_date === b.entry_date
      ? a.start_minutes - b.start_minutes
      : a.entry_date.localeCompare(b.entry_date),
  )
  const totalMinutes = sorted.reduce(
    (sum, e) => sum + e.end_minutes - e.start_minutes,
    0,
  )
  const lines: string[] = [
    `# ${formatDateRange(startDate, endDate)} 时间复盘`,
    '',
    `共 ${sorted.length} 条记录，已记录 ${formatDuration(totalMinutes)}`,
    '',
  ]

  const grouped = new Map<string, TimeEntry[]>()
  for (const entry of sorted) {
    grouped.set(entry.entry_date, [...(grouped.get(entry.entry_date) ?? []), entry])
  }

  for (const [date, dayEntries] of grouped) {
    lines.push(`## ${date}`, '')

    for (const e of dayEntries) {
      const range = `${minutesToTime(e.start_minutes)}–${minutesToTime(e.end_minutes)}`
      const dur = formatDuration(e.end_minutes - e.start_minutes)
      const title = e.title || '（无标题）'
      lines.push(`- **${range}** ${title}（${dur}）[${EFFICIENCY_LABELS[e.efficiency]}]`)
      if (e.notes?.trim()) {
        const notes = e.notes.trim().split('\n').join('\n  ')
        lines.push(`  备注：${notes}`)
      }
    }

    lines.push('')
  }

  if (sorted.length === 0) lines.push('无记录')
  lines.push('')
  return lines.join('\n')
}

export function downloadMarkdown(content: string, fileStem: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `traceday-${fileStem}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyMarkdown(content: string) {
  await navigator.clipboard.writeText(content)
}
