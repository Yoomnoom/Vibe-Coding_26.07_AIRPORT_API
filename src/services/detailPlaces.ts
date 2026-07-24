import { getPassgrAnncmt } from './airportApi'
import type { PassgrAnncmtItem } from '../types/airportApi'
import type { DayKind, PlaceType, Terminal } from '../types/congestion'

export interface DetailPlace {
  key: string
  terminal: Terminal
  placeType: PlaceType
  label: string
}

// 실제 API(공공데이터포털 15095066, getPassgrAnncmt) 응답 필드 매핑.
// data.go.kr 데이터셋 설명("표출일자, 시간대, T1 입국장 동편(A,B), T1 입국장 서편(E,F),
// T1 입국심사(C), T1 입국심사(D), T1 입국장 합계, T1 출국장1~6, 출국장 합계,
// T2 입국장1, T2 입국장2, T2입국장 합계, T2 출국장1, T2 출국장 2, T2 출국장 합계")과
// 실제 응답 필드 순서(t1eg1~4, t1dg1~6, t2eg1~2, t2dg1~2)를 대조해 확인한 값이다.
export const DETAIL_PLACES: DetailPlace[] = [
  { key: 't1eg1', terminal: 'T1', placeType: '입국장', label: 'T1 입국장 동편(A,B)' },
  { key: 't1eg2', terminal: 'T1', placeType: '입국장', label: 'T1 입국장 서편(E,F)' },
  { key: 't1eg3', terminal: 'T1', placeType: '입국심사', label: 'T1 입국심사(C)' },
  { key: 't1eg4', terminal: 'T1', placeType: '입국심사', label: 'T1 입국심사(D)' },
  { key: 't1dg1', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 1' },
  { key: 't1dg2', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 2' },
  { key: 't1dg3', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 3' },
  { key: 't1dg4', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 4' },
  { key: 't1dg5', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 5' },
  { key: 't1dg6', terminal: 'T1', placeType: '출국장', label: 'T1 출국장 6' },
  { key: 't2eg1', terminal: 'T2', placeType: '입국장', label: 'T2 입국장 1' },
  { key: 't2eg2', terminal: 'T2', placeType: '입국장', label: 'T2 입국장 2' },
  { key: 't2dg1', terminal: 'T2', placeType: '출국장', label: 'T2 출국장 1' },
  { key: 't2dg2', terminal: 'T2', placeType: '출국장', label: 'T2 출국장 2' },
]

export function findDetailPlace(key: string): DetailPlace | undefined {
  return DETAIL_PLACES.find((place) => place.key === key)
}

// 앱의 selectedTime("14:00")을 실제 API의 atime 형식("14_15")으로 변환한다.
export function toApiTimeSlot(selectedTime: string): string {
  const hour = Number(selectedTime.slice(0, 2))
  const next = (hour + 1) % 24
  return `${String(hour).padStart(2, '0')}_${String(next).padStart(2, '0')}`
}

// 선택된 오늘/내일에 해당하는 하루 전체 API 데이터를 가져온다 (24개 시간대 + 합계 행).
export async function getDetailPlaceDay(selectedDay: DayKind): Promise<PassgrAnncmtItem[]> {
  return getPassgrAnncmt(selectedDay === 'today' ? 0 : 1)
}

export function findRecordByTime(
  items: PassgrAnncmtItem[],
  selectedTime: string,
): PassgrAnncmtItem | undefined {
  const slot = toApiTimeSlot(selectedTime)
  return items.find((item) => item.atime === slot)
}

// 해당 장소(placeKey)의 예상 승객 수. 값이 없거나 숫자가 아니면 null.
export function getPlaceValue(record: PassgrAnncmtItem | undefined, placeKey: string): number | null {
  if (!record) return null
  const raw = record[placeKey]
  if (raw === undefined || raw === null || raw === '') return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}
