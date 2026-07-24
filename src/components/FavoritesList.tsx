import { useState } from 'react'
import {
  estimatePeopleCount,
  getCongestionAt,
  getScheduleStatus,
} from '../services/congestionService'
import { CONGESTION_LEVEL_STYLE } from '../utils/congestionColors'
import type { FavoriteItem } from '../types/congestion'

interface FavoritesListProps {
  isLoggedIn: boolean
  favorites: FavoriteItem[]
  error: string | null
  onSelectFavorite: (favorite: FavoriteItem) => void
  onRemoveFavorite: (id: string) => void
}

const STATUS_LABEL: Record<string, string> = {
  today: '오늘',
  tomorrow: '내일',
  past: '지난 일정',
}

function ScheduleCard({
  favorite,
  onSelectFavorite,
  onRemoveFavorite,
}: {
  favorite: FavoriteItem
  onSelectFavorite: (favorite: FavoriteItem) => void
  onRemoveFavorite: (id: string) => void
}) {
  const status = getScheduleStatus(favorite.targetDate, favorite.targetTime)
  const record =
    status === 'past'
      ? undefined
      : getCongestionAt(favorite.targetDate, favorite.targetTime).find(
          (item) => item.terminal === favorite.terminal && item.zone === favorite.zone,
        )
  const style = record ? CONGESTION_LEVEL_STYLE[record.congestionLabel] : undefined
  const isCongested = record?.congestionLabel === '혼잡'

  function handleDelete() {
    if (window.confirm('이 공항 일정을 삭제하시겠습니까?')) {
      onRemoveFavorite(favorite.id)
    }
  }

  return (
    <li className={`schedule-card ${status === 'past' ? 'schedule-card-past' : ''}`}>
      <button
        type="button"
        className="schedule-card-main"
        onClick={() => onSelectFavorite(favorite)}
      >
        <div className="schedule-card-top">
          <span className="favorite-alert" title={isCongested ? '혼잡 기준치 초과' : undefined}>
            {isCongested ? '🔥' : ''}
          </span>
          <span className="schedule-title">
            {favorite.terminal} · {favorite.zone}
          </span>
          <span className={`schedule-status-badge schedule-status-${status}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="schedule-card-time">
          {favorite.targetDate} {favorite.targetTime}
        </div>

        {record ? (
          <div className="schedule-card-metrics">
            <span
              className="schedule-pill"
              style={style ? { background: style.background, color: style.color } : undefined}
            >
              {record.congestionLevel}% · {record.congestionLabel}
            </span>
            <span className="schedule-people">
              약 {estimatePeopleCount(record.congestionLevel).toLocaleString()}명
            </span>
          </div>
        ) : (
          <p className="schedule-expired-note">조회 가능 기간이 지난 일정입니다.</p>
        )}

        <span className="schedule-detail-link">상세 보기 →</span>
      </button>

      <button type="button" className="btn-delete schedule-delete-btn" onClick={handleDelete}>
        일정 삭제
      </button>
    </li>
  )
}

export function FavoritesList({
  isLoggedIn,
  favorites,
  error,
  onSelectFavorite,
  onRemoveFavorite,
}: FavoritesListProps) {
  const [isPastOpen, setIsPastOpen] = useState(false)

  const upcoming: FavoriteItem[] = []
  const past: FavoriteItem[] = []

  favorites.forEach((favorite) => {
    const status = getScheduleStatus(favorite.targetDate, favorite.targetTime)
    ;(status === 'past' ? past : upcoming).push(favorite)
  })

  function scheduleRank(favorite: FavoriteItem): number {
    const status = getScheduleStatus(favorite.targetDate, favorite.targetTime)
    return status === 'today' ? 0 : status === 'tomorrow' ? 1 : 2
  }

  function sortSchedules(items: FavoriteItem[]): FavoriteItem[] {
    return [...items].sort((a, b) => {
      const rankDiff = scheduleRank(a) - scheduleRank(b)
      if (rankDiff !== 0) return rankDiff
      if (a.targetDate !== b.targetDate) return a.targetDate.localeCompare(b.targetDate)
      return a.targetTime.localeCompare(b.targetTime)
    })
  }

  const sortedUpcoming = sortSchedules(upcoming)
  const sortedPast = sortSchedules(past)

  return (
    <section className="favorites-list">
      <h2>내 공항 일정</h2>

      {error && <p className="auth-error">{error}</p>}

      {!isLoggedIn ? (
        <p>로그인 후 저장된 공항 일정을 확인할 수 있습니다.</p>
      ) : favorites.length === 0 ? (
        <>
          <p>저장된 공항 일정이 없습니다.</p>
          <p className="favorites-empty-hint">
            오늘 또는 내일 방문할 터미널과 시간을 저장하면 혼잡도를 빠르게 다시 확인할 수 있습니다.
          </p>
        </>
      ) : (
        <div className="favorite-groups">
          {sortedUpcoming.length > 0 && (
            <ul>
              {sortedUpcoming.map((favorite) => (
                <ScheduleCard
                  key={favorite.id}
                  favorite={favorite}
                  onSelectFavorite={onSelectFavorite}
                  onRemoveFavorite={onRemoveFavorite}
                />
              ))}
            </ul>
          )}

          {sortedPast.length > 0 && (
            <div className="favorite-group">
              <button
                type="button"
                className="favorite-group-header"
                onClick={() => setIsPastOpen((prev) => !prev)}
                aria-expanded={isPastOpen}
              >
                <span>
                  지난 일정 <span className="favorite-group-count">{sortedPast.length}</span>
                </span>
                <span className={`favorite-group-chevron ${isPastOpen ? 'open' : ''}`}>▾</span>
              </button>

              {isPastOpen && (
                <ul>
                  {sortedPast.map((favorite) => (
                    <ScheduleCard
                      key={favorite.id}
                      favorite={favorite}
                      onSelectFavorite={onSelectFavorite}
                      onRemoveFavorite={onRemoveFavorite}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
