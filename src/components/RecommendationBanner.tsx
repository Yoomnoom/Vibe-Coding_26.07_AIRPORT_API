import type { CongestionRecord, Terminal, Zone } from '../types/congestion'
import { CONGESTION_LEVEL_STYLE } from '../utils/congestionColors'

interface RecommendationBannerProps {
  dayRecords: CongestionRecord[]
  zone: Zone
  onSelectTime: (time: string) => void
}

const TERMINALS: Terminal[] = ['T1', 'T2']

function findBestRecord(
  dayRecords: CongestionRecord[],
  terminal: Terminal,
  zone: Zone,
): CongestionRecord | null {
  const records = dayRecords.filter((record) => record.terminal === terminal && record.zone === zone)
  if (records.length === 0) return null
  return records.reduce((best, record) => (record.congestionLevel < best.congestionLevel ? record : best))
}

export function RecommendationBanner({ dayRecords, zone, onSelectTime }: RecommendationBannerProps) {
  return (
    <section className="recommendation-banner">
      <h2>{zone} 추천 시간 (가장 여유로운 시간)</h2>
      <div className="recommendation-grid">
        {TERMINALS.map((terminal) => {
          const best = findBestRecord(dayRecords, terminal, zone)
          const style = best ? CONGESTION_LEVEL_STYLE[best.congestionLabel] : undefined
          return (
            <button
              type="button"
              key={terminal}
              className="recommendation-tile"
              disabled={!best}
              onClick={() => best && onSelectTime(best.time)}
            >
              <span className="recommendation-terminal">{terminal}</span>
              {best ? (
                <>
                  <span className="recommendation-time">{best.time}</span>
                  <span
                    className="recommendation-badge"
                    style={style ? { background: style.background, color: style.color } : undefined}
                  >
                    {best.congestionLevel}% · {best.congestionLabel}
                  </span>
                </>
              ) : (
                <span className="recommendation-badge">데이터 없음</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
