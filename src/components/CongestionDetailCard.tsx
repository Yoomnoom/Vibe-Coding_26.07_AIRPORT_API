import { DateTimeSelector } from './DateTimeSelector'
import { CONGESTION_LEVEL_STYLE } from '../utils/congestionColors'
import { estimatePeopleCount } from '../services/congestionService'
import type { CongestionRecord } from '../types/congestion'

interface CongestionDetailCardProps {
  selectedDate: string
  selectedTime: string
  availableTimes: string[]
  onChangeDate: (date: string) => void
  onChangeTime: (time: string) => void
  records: CongestionRecord[]
  isLiveMode: boolean
  onGoLive: () => void
  lastRefreshedAt: Date
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function CongestionDetailCard({
  selectedDate,
  selectedTime,
  availableTimes,
  onChangeDate,
  onChangeTime,
  records,
  isLiveMode,
  onGoLive,
  lastRefreshedAt,
}: CongestionDetailCardProps) {
  return (
    <section className="congestion-detail-card">
      <div className="chart-header">
        <h2>
          {selectedDate} {selectedTime} 상세 혼잡도
        </h2>
        <div className="chart-header">
          {isLiveMode ? (
            <span className="live-indicator">
              <span className="live-dot" /> 실시간 (5분마다 자동 갱신) · 마지막 갱신 {formatClock(lastRefreshedAt)}
            </span>
          ) : (
            <button type="button" className="btn-ghost" onClick={onGoLive}>
              실시간으로
            </button>
          )}
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={availableTimes}
            onChangeDate={onChangeDate}
            onChangeTime={onChangeTime}
          />
        </div>
      </div>

      {records.length === 0 ? (
        <p>선택한 시점의 데이터가 없습니다.</p>
      ) : (
        <div className="congestion-detail-grid">
          {records.map((record) => {
            const style = CONGESTION_LEVEL_STYLE[record.congestionLabel]
            return (
              <div className="congestion-detail-tile" key={`${record.terminal}-${record.zone}`}>
                <div className="tile-header">
                  <span className="tile-header-label">
                    <span className="tile-terminal">{record.terminal}</span>
                    <span className="tile-zone">{record.zone}</span>
                  </span>
                  <span className="tile-people-count">
                    약 {estimatePeopleCount(record.congestionLevel).toLocaleString()}명
                  </span>
                </div>
                <div
                  className="tile-level"
                  style={style ? { background: style.background, color: style.color } : undefined}
                >
                  <span className="tile-level-value">{record.congestionLevel}%</span>
                  <span className="tile-label">{record.congestionLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
