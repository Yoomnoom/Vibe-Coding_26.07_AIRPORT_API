export type Terminal = 'T1' | 'T2'
export type Zone = '입국장' | '출국장'
export type DayKind = 'today' | 'tomorrow'

export interface CongestionRecord {
  date: string
  time: string
  terminal: Terminal
  zone: Zone
  congestionLevel: number
  congestionLabel: string
}

export type PlaceType = '입국장' | '입국심사' | '출국장'

// 관심 출입국장(세부 장소) — 실제 공공데이터 API 필드(placeKey)를 저장한다.
// 날짜/시간은 저장하지 않는다 (선택된 오늘/내일·시간에 맞춰 매번 다시 조회한다).
export interface InterestPlace {
  id: string
  userId: string
  terminal: Terminal
  placeType: PlaceType
  placeKey: string
  placeLabel: string
  createdAt: string
}

export interface NewInterestPlaceInput {
  terminal: Terminal
  placeType: PlaceType
  placeKey: string
  placeLabel: string
}
