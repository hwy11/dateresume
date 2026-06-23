import { addDays, formatDateNav, isToday } from '../lib/time'

interface HeaderProps {
  dateKey: string
  onDateChange: (key: string) => void
  onExport: () => void
  userEmail?: string
  onSignOut: () => void
  showMenu: boolean
  onToggleMenu: () => void
}

export function Header({
  dateKey,
  onDateChange,
  onExport,
  userEmail,
  onSignOut,
  showMenu,
  onToggleMenu,
}: HeaderProps) {
  const initial = userEmail?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
      <div className="flex-1">
        <span className="text-lg font-bold text-text tracking-tight">TraceDay</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-text">
        <button
          type="button"
          onClick={() => onDateChange(addDays(dateKey, -1))}
          className="w-8 h-8 rounded-lg hover:bg-bg text-text-weak hover:text-text transition-colors"
          aria-label="前一天"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onDateChange(addDays(dateKey, 0))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-bg transition-colors min-w-[180px] justify-center"
        >
          <svg className="w-4 h-4 text-text-weak" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDateNav(isToday(dateKey) ? dateKey : dateKey).replace(/ 周./, '')}</span>
          {isToday(dateKey) && <span className="text-text-weak">今天</span>}
        </button>
        <button
          type="button"
          onClick={() => onDateChange(addDays(dateKey, 1))}
          className="w-8 h-8 rounded-lg hover:bg-bg text-text-weak hover:text-text transition-colors"
          aria-label="后一天"
        >
          →
        </button>
      </div>

      <div className="flex-1 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-weak hover:text-text border border-border rounded-lg hover:bg-bg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出 Markdown
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleMenu()
            }}
            className="flex items-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-sm font-medium flex items-center justify-center">
              {initial}
            </div>
            <svg className="w-3 h-3 text-text-weak" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
              <div className="px-3 py-2 text-xs text-text-weak truncate border-b border-border">
                {userEmail}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full text-left px-3 py-2 text-sm hover:bg-bg text-text"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
