import { getCongestionAt } from '../services/congestionService'
import type { FavoriteItem } from '../types/congestion'

interface FavoritesListProps {
  isLoggedIn: boolean
  favorites: FavoriteItem[]
  error: string | null
  onSelectFavorite: (favorite: FavoriteItem) => void
  onRemoveFavorite: (id: string) => void
}

export function FavoritesList({
  isLoggedIn,
  favorites,
  error,
  onSelectFavorite,
  onRemoveFavorite,
}: FavoritesListProps) {
  return (
    <section className="favorites-list">
      <h2>즐겨찾기</h2>

      {error && <p className="auth-error">{error}</p>}

      {!isLoggedIn ? (
        <p>로그인 후 즐겨찾기를 확인할 수 있습니다.</p>
      ) : favorites.length === 0 ? (
        <p>저장된 즐겨찾기가 없습니다.</p>
      ) : (
        <ul>
          {favorites.map((favorite) => {
            const isCongested = getCongestionAt(favorite.targetDate, favorite.targetTime).some(
              (record) =>
                record.terminal === favorite.terminal &&
                record.zone === favorite.zone &&
                record.congestionLabel === '혼잡',
            )
            return (
              <li key={favorite.id}>
                <button
                  type="button"
                  className="favorite-item"
                  onClick={() => onSelectFavorite(favorite)}
                >
                  {isCongested && (
                    <span className="favorite-alert" title="혼잡 기준치 초과">
                      🔥
                    </span>
                  )}
                  {favorite.terminal} · {favorite.zone} · {favorite.targetDate}{' '}
                  {favorite.targetTime}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => onRemoveFavorite(favorite.id)}
                >
                  삭제
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
