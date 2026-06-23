import { calcStats, formatDuration } from '../lib/time'
import {
  EFFICIENCY_COLORS,
  EFFICIENCY_LABELS,
  type Efficiency,
  type TimeEntry,
} from '../types'

interface TodayOverviewProps {
  entries: TimeEntry[]
}

const EFF_KEYS: Efficiency[] = ['high', 'medium', 'low']

export function TodayOverview({ entries }: TodayOverviewProps) {
  const stats = calcStats(entries)
  const labeledTotal = stats.byEff.high + stats.byEff.medium + stats.byEff.low

  return (
    <aside className="w-56 shrink-0 border-l border-border p-5 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-text">今日概览</h2>

      <div>
        <div className="text-xs text-text-weak mb-1">已记录</div>
        <div className="text-2xl font-bold text-text">{formatDuration(stats.recorded)}</div>
        <div className="text-xs text-text-weak mt-2">
          未记录 <span className="text-text font-medium">{formatDuration(stats.unrecorded)}</span>
        </div>
      </div>

      <div>
        <div className="text-xs text-text-weak mb-3">效率分布（按已记录时长）</div>
        <div className="space-y-3">
          {EFF_KEYS.map((eff) => {
            const dur = stats.byEff[eff]
            const pct = labeledTotal > 0 ? Math.round((dur / labeledTotal) * 100) : 0
            return (
              <div key={eff}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-weak">{EFFICIENCY_LABELS[eff]}</span>
                  <span className="text-text">
                    {formatDuration(dur)}
                    {labeledTotal > 0 && (
                      <span className="text-text-weak ml-1">({pct}%)</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      background: EFFICIENCY_COLORS[eff],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-xs text-text-weak">
        记录数量 <span className="text-text font-medium">{stats.count}</span> 条
      </div>

      <div className="mt-auto pt-4 border-t border-border text-[11px] text-text-weak leading-relaxed space-y-1">
        <p>拖拽空白区域可快速记录时间</p>
        <p>点击时间块可切换效率标记</p>
        <p>滚轮 / ± 可缩放时间轴精度</p>
      </div>
    </aside>
  )
}
