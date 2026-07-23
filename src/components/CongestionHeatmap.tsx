import { Fragment } from 'react'
import type { CongestionRecord, Terminal, Zone } from '../types/congestion'
import { CONGESTION_LEVEL_STYLE } from '../utils/congestionColors'

interface CongestionHeatmapProps {
  dayRecords: CongestionRecord[]
  selectedTime: string
  onSelectTime: (time: string) => void
}

const ROWS: Array<{ terminal: Terminal; zone: Zone }> = [
  { terminal: 'T1', zone: '입국장' },
  { terminal: 'T1', zone: '출국장' },
  { terminal: 'T2', zone: '입국장' },
  { terminal: 'T2', zone: '출국장' },
]

const TIMES = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)

const FIRE_THRESHOLD = 90

function isHourBlockEnd(time: string): boolean {
  const hour = Number(time.slice(0, 2))
  return hour % 6 === 5
}

export function CongestionHeatmap({ dayRecords, selectedTime, onSelectTime }: CongestionHeatmapProps) {
  function findRecord(terminal: Terminal, zone: Zone, time: string) {
    return dayRecords.find(
      (record) => record.terminal === terminal && record.zone === zone && record.time === time,
    )
  }

  return (
    <section className="congestion-heatmap">
      <div className="chart-header">
        <h2>장소·시간별 혼잡도 한눈에 보기 (1시간 단위)</h2>
        <span className="heatmap-unit-note">(단위: %)</span>
      </div>

      <div className="heatmap-scroll">
        <div
          className="heatmap-grid"
          style={{ gridTemplateColumns: `80px repeat(${TIMES.length}, minmax(28px, 1fr))` }}
        >
          <div className="heatmap-cell heatmap-corner" />
          {TIMES.map((time) => (
            <button
              key={time}
              type="button"
              className={`heatmap-cell heatmap-time-label ${time === selectedTime ? 'selected' : ''} ${isHourBlockEnd(time) ? 'hour-block-end' : ''}`}
              onClick={() => onSelectTime(time)}
              title={time}
            >
              {time.slice(0, 2)}
            </button>
          ))}

          {ROWS.map(({ terminal, zone }) => (
            <Fragment key={`${terminal}-${zone}`}>
              <div className="heatmap-cell heatmap-row-label">
                {terminal} {zone}
              </div>
              {TIMES.map((time) => {
                const record = findRecord(terminal, zone, time)
                const style = record ? CONGESTION_LEVEL_STYLE[record.congestionLabel] : undefined
                return (
                  <button
                    key={`${terminal}-${zone}-${time}`}
                    type="button"
                    className={`heatmap-cell heatmap-value-cell ${time === selectedTime ? 'selected' : ''} ${isHourBlockEnd(time) ? 'hour-block-end' : ''}`}
                    style={style ? { background: style.background, color: style.color } : undefined}
                    onClick={() => onSelectTime(time)}
                    title={
                      record
                        ? `${terminal} ${zone} ${time} · ${record.congestionLabel} (${record.congestionLevel}%)`
                        : undefined
                    }
                  >
                    {record ? record.congestionLevel : '-'}
                    {record && record.congestionLevel >= FIRE_THRESHOLD && (
                      <span className="heatmap-fire">🔥</span>
                    )}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        {Object.entries(CONGESTION_LEVEL_STYLE).map(([label, style]) => (
          <span className="heatmap-legend-item" key={label}>
            <span className="heatmap-legend-swatch" style={{ background: style.background }} />
            {label}
          </span>
        ))}
      </div>
    </section>
  )
}
