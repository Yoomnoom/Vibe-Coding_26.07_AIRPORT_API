import { supabase } from './supabaseClient'
import type { PassgrAnncmtApiResponse, PassgrAnncmtItem, SelectDate } from '../types/airportApi'

export async function getPassgrAnncmt(selectdate: SelectDate): Promise<PassgrAnncmtItem[]> {
  const { data, error } = await supabase.functions.invoke<PassgrAnncmtApiResponse>(
    'airport-proxy',
    { body: { selectdate } },
  )

  if (error) {
    let detail = error.message
    const context = (error as { context?: Response }).context
    if (context) {
      try {
        const errorBody = await context.json()
        if (errorBody?.error) detail = errorBody.error
      } catch {
        // 응답 본문이 JSON이 아니면 기본 에러 메시지를 그대로 사용한다.
      }
    }
    throw new Error(`공공데이터포털 API 프록시(airport-proxy) 호출에 실패했습니다: ${detail}`)
  }

  console.log('[getPassgrAnncmt] raw response:', data)

  if (!data || !data.response) {
    throw new Error(
      '공공데이터포털 API가 JSON이 아닌 응답(트래픽 제한/점검 시 XML 오류 등)을 반환했을 수 있습니다. 콘솔의 원본 응답을 확인하세요.',
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
