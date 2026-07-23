import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CongestionRecord, Zone } from '../types/congestion'
import { getChartTheme } from '../utils/chartTheme'

interface CongestionTrendChartProps {
  dayRecords: CongestionRecord[]
  zone: Zone
  onChangeZone: (zone: Zone) => void
  selectedTime: string
  isDarkMode: boolean
}

interface TrendRow {
  time: string
  T1: number
  T2: number
}

function toTrendRows(dayRecords: CongestionRecord[], zone: Zone): TrendRow[] {
  const rowsByTime = new Map<string, TrendRow>()

  dayRecords
    .filter((record) => record.zone === zone)
    .forEach((record) => {
      const row = rowsByTime.get(record.time) ?? { time: record.time, T1: 0, T2: 0 }
      row[record.terminal] = record.congestionLevel
      rowsByTime.set(record.time, row)
    })

  return Array.from(rowsByTime.values()).sort((a, b) => a.time.localeCompare(b.time))
}

export function CongestionTrendChart({
  dayRecords,
  zone,
  onChangeZone,
  selectedTime,
  isDarkMode,
}: CongestionTrendChartProps) {
  const theme = getChartTheme(isDarkMode)
  const rows = toTrendRows(dayRecords, zone)

  return (
    <section className="congestion-trend-chart">
      <div className="chart-header">
        <h2>시간대별 혼잡도 추이</h2>
        <div className="zone-toggle">
          <button
            type="button"
            className={zone === '입국장' ? 'active' : ''}
            onClick={() => onChangeZone('입국장')}
          >
            입국장
          </button>
          <button
            type="button"
            className={zone === '출국장' ? 'active' : ''}
            onClick={() => onChangeZone('출국장')}
          >
            출국장
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={rows} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis dataKey="time" tick={{ fill: theme.axisColor }} stroke={theme.axisColor} />
          <YAxis unit="%" tick={{ fill: theme.axisColor }} stroke={theme.axisColor} />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBackground,
              border: `1px solid ${theme.tooltipBorder}`,
              color: theme.tooltipText,
            }}
          />
          <Legend wrapperStyle={{ color: theme.axisColor }} />
          <ReferenceLine x={selectedTime} stroke={theme.axisColor} strokeDasharray="4 4" />
          <Bar dataKey="T1" fill="#7353ea" fillOpacity={0.25} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="T2" fill="#2f5efb" fillOpacity={0.25} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Line type="monotone" dataKey="T1" stroke="#7353ea" strokeWidth={2} dot={false} legendType="none" />
          <Line type="monotone" dataKey="T2" stroke="#2f5efb" strokeWidth={2} dot={false} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  )
}
