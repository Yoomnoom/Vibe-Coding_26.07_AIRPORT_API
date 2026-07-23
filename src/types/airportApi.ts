// 실제 API 응답 필드 스펙 미확정 (PRD.md 5장 참고) — 콘솔 확인 후 확정 필요.
// 그 전까지는 알려진 값을 존중하되 모르는 필드도 깨지지 않도록 넓게 받아둔다.
export type SelectDate = 0 | 1

export interface PassgrAnncmtItem {
  [key: string]: unknown
}

export interface PassgrAnncmtApiHeader {
  resultCode: string
  resultMsg: string
}

export interface PassgrAnncmtApiBody {
  items: PassgrAnncmtItem[] | { item: PassgrAnncmtItem[] | PassgrAnncmtItem } | ''
  numOfRows?: number
  pageNo?: number
  totalCount?: number
}

export interface PassgrAnncmtApiResponse {
  response: {
    header: PassgrAnncmtApiHeader
    body: PassgrAnncmtApiBody
  }
}
