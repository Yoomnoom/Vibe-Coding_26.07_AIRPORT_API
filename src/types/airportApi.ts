// 실제 응답 필드는 src/services/detailPlaces.ts의 DETAIL_PLACES 매핑 참고
// (adate, atime, t1eg1~4, t1dg1~6, t2eg1~2, t2dg1~2, *sum*, tmp1/tmp2 확인됨).
// 그 외 알려지지 않은 필드가 섞여도 깨지지 않도록 넓게 받아둔다.
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
