import { supabase } from './supabaseClient'
import type { FavoriteItem, NewFavoriteInput, Terminal, Zone } from '../types/congestion'

interface FavoriteRow {
  id: string
  user_id: string
  terminal: string
  zone: string
  adate: string
  atime: string
  created_at: string
}

function toFavoriteItem(row: FavoriteRow): FavoriteItem {
  return {
    id: row.id,
    userId: row.user_id,
    terminal: row.terminal as Terminal,
    zone: row.zone as Zone,
    targetDate: row.adate,
    targetTime: row.atime.slice(0, 5),
    createdAt: row.created_at,
  }
}

export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as FavoriteRow[]).map(toFavoriteItem)
}

export async function addFavorite(
  userId: string,
  input: NewFavoriteInput,
): Promise<FavoriteItem> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      terminal: input.terminal,
      zone: input.zone,
      adate: input.targetDate,
      atime: input.targetTime,
    })
    .select()
    .single()

  if (error) throw error
  return toFavoriteItem(data as FavoriteRow)
}

export async function removeFavorite(id: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('id', id)
  if (error) throw error
}
