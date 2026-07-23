import { useState } from 'react'
import { getCongestionAt } from '../services/congestionService'
import type { FavoriteItem, Terminal } from '../types/congestion'

interface FavoritesListProps {
  isLoggedIn: boolean
  favorites: FavoriteItem[]
  error: string | null
  onSelectFavorite: (favorite: FavoriteItem) => void
  onRemoveFavorite: (id: string) => void
}

const TERMINALS: Terminal[] = ['T1', 'T2']

export function FavoritesList({
  isLoggedIn,
  favorites,
  error,
  onSelectFavorite,
  onRemoveFavorite,
}: FavoritesListProps) {
  const [expanded, setExpanded] = useState<Record<Terminal, boolean>>({ T1: true, T2: true })

  function toggleGroup(terminal: Terminal) {
    setExpanded((prev) => ({ ...prev, [terminal]: !prev[terminal] }))
  }

  return (
    <section className="favorites-list">
      <h2>즐겨찾기</h2>

      {error && <p className="auth-error">{error}</p>}

      {!isLoggedIn ? (
        <p>로그인 후 즐겨찾기를 확인할 수 있습니다.</p>
      ) : favorites.length === 0 ? (
        <p>저장된 즐겨찾기가 없습니다.</p>
      ) : (
        <div className="favorite-groups">
          {TERMINALS.map((terminal) => {
            const groupItems = favorites.filter((favorite) => favorite.terminal === terminal)
            if (groupItems.length === 0) return null
            const isOpen = expanded[terminal]

            return (
              <div className="favorite-group" key={terminal}>
                <button
                  type="button"
                  className="favorite-group-header"
                  onClick={() => toggleGroup(terminal)}
                  aria-expanded={isOpen}
                >
                  <span>
                    {terminal} <span className="favorite-group-count">{groupItems.length}</span>
                  </span>
                  <span className={`favorite-group-chevron ${isOpen ? 'open' : ''}`}>▾</span>
                </button>

                {isOpen && (
                  <ul>
                    {groupItems.map((favorite) => {
                      const isCongested = getCongestionAt(
                        favorite.targetDate,
                        favorite.targetTime,
                      ).some(
                        (record) =>
                          record.terminal === favorite.terminal &&
                          record.zone === favorite.zone &&
                          record.congestionLabel === '혼잡',
                      )
                      return (
                        <li key={favorite.id} className="favorite-row">
                          <button
                            type="button"
                            className="favorite-item"
                            onClick={() => onSelectFavorite(favorite)}
                          >
                            <span className="favorite-title">
                              <span
                                className="favorite-alert"
                                title={isCongested ? '혼잡 기준치 초과' : undefined}
                              >
                                {isCongested ? '🔥' : ''}
                              </span>
                              {favorite.terminal} · {favorite.zone}
                              <span className="favorite-time">
                                {favorite.targetDate} {favorite.targetTime}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => onRemoveFavorite(favorite.id)}
                          >
                            삭제
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
