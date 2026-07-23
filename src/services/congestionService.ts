import type { CongestionRecord, Terminal, Zone } from '../types/congestion'

// TODO: 실제 연동 시 공공데이터포털 API(VITE_AIRPORT_API_KEY) 호출로 교체.
// 지금은 화면 뼈대 확인용 하드코딩 데이터를 반환한다.

const TERMINALS: Terminal[] = ['T1', 'T2']
const ZONES: Zone[] = ['입국장', '출국장']
const TIMES = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)

export function labelOf(level: number): string {
  if (level >= 80) return '혼잡'
  if (level >= 50) return '보통'
  return '원활'
}

function buildMockDay(date: string, seed: number): CongestionRecord[] {
  const records: CongestionRecord[] = []
  TIMES.forEach((time, timeIndex) => {
    TERMINALS.forEach((terminal, terminalIndex) => {
      ZONES.forEach((zone, zoneIndex) => {
        const base =
          30 +
          ((seed + timeIndex * 13 + terminalIndex * 21 + zoneIndex * 7) % 65)
        records.push({
          date,
          time,
          terminal,
          zone,
          congestionLevel: base,
          congestionLabel: labelOf(base),
        })
      })
    })
  })
  return records
}

export const TODAY_DATE = '2026-07-23'
export const TOMORROW_DATE = '2026-07-24'

const todayMock = buildMockDay(TODAY_DATE, 5)
const tomorrowMock = buildMockDay(TOMORROW_DATE, 40)

export function getTodayCongestion(): CongestionRecord[] {
  return todayMock
}

export function getTomorrowCongestion(): CongestionRecord[] {
  return tomorrowMock
}

export function getCongestionAt(date: string, time: string): CongestionRecord[] {
  const pool = date === TOMORROW_DATE ? tomorrowMock : todayMock
  return pool.filter((record) => record.date === date && record.time === time)
}

export function getAvailableTimes(): string[] {
  return TIMES
}

export function getCurrentTimeSlot(): string {
  return `${String(new Date().getHours()).padStart(2, '0')}:00`
}

// 혼잡도 100% 기준 가정 인원. 실제 공공데이터 API에 인원수 필드가 있는지 확인되면 교체한다.
const ESTIMATED_ZONE_CAPACITY = 800

export function estimatePeopleCount(level: number): number {
  return Math.round((level / 100) * ESTIMATED_ZONE_CAPACITY)
}
