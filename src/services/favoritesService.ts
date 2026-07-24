import { supabase } from './supabaseClient'
import type { InterestPlace, NewInterestPlaceInput, PlaceType, Terminal } from '../types/congestion'

interface FavoriteRow {
  id: string
  user_id: string
  terminal: string | null
  place_type: string | null
  place_key: string | null
  place_label: string | null
  created_at: string
}

function toInterestPlace(row: FavoriteRow): InterestPlace | null {
  // 레거시(날짜/시간 기반) 행은 place_key가 비어 있다 — 새 UI에서는 표시하지 않는다.
  if (!row.place_key || !row.place_type || !row.place_label || !row.terminal) return null
  return {
    id: row.id,
    userId: row.user_id,
    terminal: row.terminal as Terminal,
    placeType: row.place_type as PlaceType,
    placeKey: row.place_key,
    placeLabel: row.place_label,
    createdAt: row.created_at,
  }
}

export async function getInterestPlaces(userId: string): Promise<InterestPlace[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, user_id, terminal, place_type, place_key, place_label, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as FavoriteRow[]).map(toInterestPlace).filter((item): item is InterestPlace => item !== null)
}

export async function addInterestPlace(
  userId: string,
  input: NewInterestPlaceInput,
): Promise<InterestPlace> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      terminal: input.terminal,
      place_type: input.placeType,
      place_key: input.placeKey,
      place_label: input.placeLabel,
    })
    .select('id, user_id, terminal, place_type, place_key, place_label, created_at')
    .single()

  if (error) throw error
  const item = toInterestPlace(data as FavoriteRow)
  if (!item) throw new Error('관심 장소 저장 결과를 확인할 수 없습니다.')
  return item
}

export async function removeInterestPlace(id: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('id', id)
  if (error) throw error
}
