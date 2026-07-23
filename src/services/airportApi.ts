import type { PassgrAnncmtApiResponse, PassgrAnncmtItem, SelectDate } from '../types/airportApi'

const ENDPOINT = 'https://apis.data.go.kr/B551177/passgrAnncmt/getPassgrAnncmt'

export async function getPassgrAnncmt(selectdate: SelectDate): Promise<PassgrAnncmtItem[]> {
  const serviceKey = import.meta.env.VITE_AIRPORT_API_KEY
  if (!serviceKey) {
    throw new Error('VITE_AIRPORT_API_KEY가 설정되어 있지 않습니다. .env를 확인하세요.')
  }

  const url = new URL(ENDPOINT)
  url.searchParams.set('serviceKey', serviceKey)
  url.searchParams.set('type', 'json')
  url.searchParams.set('selectdate', String(selectdate))
  url.searchParams.set('numOfRows', '100')

  let res: Response
  try {
    res = await fetch(url.toString())
  } catch (err) {
    throw new Error(
      `공공데이터포털 API 호출에 실패했습니다 (네트워크 오류 또는 CORS 차단 가능성): ${(err as Error).message}`,
    )
  }

  if (!res.ok) {
    throw new Error(`공공데이터포털 API가 오류 상태(HTTP ${res.status})를 반환했습니다.`)
  }

  const rawText = await res.text()
  console.log('[getPassgrAnncmt] raw response:', rawText)

  let data: PassgrAnncmtApiResponse
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(
      '공공데이터포털 API가 JSON이 아닌 응답(트래픽 제한/점검 시 XML 오류 등)을 반환했습니다. 콘솔의 원본 응답을 확인하세요.',
    )
  }

  const { header, body } = data.response

  if (header.resultCode !== '00') {
    throw new Error(`공공데이터포털 API 오류 (${header.resultCode}): ${header.resultMsg}`)
  }

  if (!body.items) return []
  if (Array.isArray(body.items)) return body.items

  const inner = body.items.item
  if (Array.isArray(inner)) return inner
  return inner ? [inner] : []
}
