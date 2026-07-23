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

export interface FavoriteItem {
  id: string
  userId: string
  terminal: Terminal
  zone: Zone
  targetDate: string
  targetTime: string
  createdAt: string
}

export interface NewFavoriteInput {
  terminal: Terminal
  zone: Zone
  targetDate: string
  targetTime: string
}
