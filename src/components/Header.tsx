import type { ReactNode } from 'react'
import type { DayKind } from '../types/congestion'

interface HeaderProps {
  selectedDay: DayKind
  onSelectDay: (day: DayKind) => void
  onRefresh: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  authSlot: ReactNode
}

export function Header({
  selectedDay,
  onSelectDay,
  onRefresh,
  isDarkMode,
  onToggleDarkMode,
  authSlot,
}: HeaderProps) {
  return (
    <header className="app-header">
      <h1>인천공항 혼잡도 대시보드</h1>

      <div className="header-controls">
        <div className="day-toggle">
          <button
            type="button"
            className={selectedDay === 'today' ? 'active' : ''}
            onClick={() => onSelectDay('today')}
          >
            오늘
          </button>
          <button
            type="button"
            className={selectedDay === 'tomorrow' ? 'active' : ''}
            onClick={() => onSelectDay('tomorrow')}
          >
            내일
          </button>
          <button type="button" onClick={onRefresh} aria-label="새로고침">
            새로고침
          </button>
        </div>

        <button type="button" onClick={onToggleDarkMode} aria-label="다크모드 전환">
          {isDarkMode ? '라이트 모드' : '다크 모드'}
        </button>

        {authSlot}
      </div>
    </header>
  )
}
