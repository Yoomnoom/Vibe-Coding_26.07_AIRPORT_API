import { useEffect, useState } from 'react'
import {
  DETAIL_PLACES,
  findRecordByTime,
  getDetailPlaceDay,
  getPlaceValue,
} from '../services/detailPlaces'
import type { PassgrAnncmtItem } from '../types/airportApi'
import type { DayKind, InterestPlace, NewInterestPlaceInput } from '../types/congestion'

interface FavoritesListProps {
  isLoggedIn: boolean
  places: InterestPlace[]
  error: string | null
  selectedDay: DayKind
  selectedTime: string
  onAddPlace: (input: NewInterestPlaceInput) => void
  onRemovePlace: (id: string) => void
}

interface RankedPlace {
  place: InterestPlace
  value: number | null
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString()
}

export function FavoritesList({
  isLoggedIn,
  places,
  error,
  selectedDay,
  selectedTime,
  onAddPlace,
  onRemovePlace,
}: FavoritesListProps) {
  const [dayItems, setDayItems] = useState<PassgrAnncmtItem[]>([])
  const [isLoadingDay, setIsLoadingDay] = useState(false)
  const [dayError, setDayError] = useState<string | null>(null)
  const [pickedKey, setPickedKey] = useState(DETAIL_PLACES[0].key)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoadingDay(true)
    setDayError(null)
    getDetailPlaceDay(selectedDay)
      .then((items) => {
        if (!cancelled) setDayItems(items)
      })
      .catch((err: Error) => {
        if (!cancelled) setDayError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDay(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedDay])

  const currentRecord = findRecordByTime(dayItems, selectedTime)

  const ranked: RankedPlace[] = places
    .map((place) => ({ place, value: getPlaceValue(currentRecord, place.placeKey) }))
    .sort((a, b) => {
      if (a.value === null && b.value === null) return 0
      if (a.value === null) return 1
      if (b.value === null) return -1
      return a.value - b.value
    })

  const validValues = ranked.filter((r) => r.value !== null)
  const bestValue = validValues[0]?.value ?? null

  const pickedPlace = DETAIL_PLACES.find((place) => place.key === pickedKey) ?? DETAIL_PLACES[0]
  const isPickedSaved = places.some((place) => place.placeKey === pickedKey)

  function handleSave() {
    onAddPlace({
      terminal: pickedPlace.terminal,
      placeType: pickedPlace.placeType,
      placeKey: pickedPlace.key,
      placeLabel: pickedPlace.label,
    })
  }

  return (
    <section className="favorites-list">
      <h2>내 관심 출입국장</h2>
      <p className="favorites-empty-hint">자주 확인하거나 비교할 출입국장을 저장해보세요.</p>

      {error && <p className="auth-error">{error}</p>}
      {dayError && <p className="auth-error">{dayError}</p>}

      <div className="place-picker">
        <select
          value={pickedKey}
          onChange={(event) => setPickedKey(event.target.value)}
          aria-label="세부 출입국장 선택"
        >
          <optgroup label="T1">
            {DETAIL_PLACES.filter((place) => place.terminal === 'T1').map((place) => (
              <option key={place.key} value={place.key}>
                {place.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="T2">
            {DETAIL_PLACES.filter((place) => place.terminal === 'T2').map((place) => (
              <option key={place.key} value={place.key}>
                {place.label}
              </option>
            ))}
          </optgroup>
        </select>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={isLoggedIn && isPickedSaved}
        >
          {isLoggedIn && isPickedSaved ? '저장됨' : '관심 장소 저장'}
        </button>
      </div>

      {!isLoggedIn ? (
        <p>로그인 후 저장된 관심 출입국장을 확인할 수 있습니다.</p>
      ) : places.length === 0 ? (
        <p>저장된 관심 출입국장이 없습니다.</p>
      ) : (
        <ul>
          {ranked.map(({ place, value }, index) => {
            const isBest = value !== null && value === bestValue
            const diff = value !== null && bestValue !== null ? value - bestValue : null
            const isExpanded = expandedId === place.id

            function handleDelete() {
              if (window.confirm('이 관심 장소를 삭제하시겠습니까?')) {
                onRemovePlace(place.id)
              }
            }

            const sameTerminalToday = DETAIL_PLACES.filter((p) => p.terminal === place.terminal)
              .map((p) => ({ place: p, value: getPlaceValue(currentRecord, p.key) }))
              .filter((p): p is { place: (typeof DETAIL_PLACES)[number]; value: number } => p.value !== null)
              .sort((a, b) => a.value - b.value)

            const hourlyValues = dayItems
              .filter((item) => item.atime !== '합계')
              .map((item) => ({
                time: String(item.atime),
                value: getPlaceValue(item, place.placeKey),
              }))
              .filter((entry): entry is { time: string; value: number } => entry.value !== null)

            const bestHour = hourlyValues.reduce<{ time: string; value: number } | null>(
              (best, entry) => (best === null || entry.value < best.value ? entry : best),
              null,
            )

            return (
              <li key={place.id} className="schedule-card">
                <div className="schedule-card-main">
                  <div className="schedule-card-top">
                    {isBest && <span className="schedule-status-badge schedule-status-today">가장 여유로움</span>}
                    <span className="schedule-title">
                      {place.terminal} {place.placeLabel.replace(`${place.terminal} `, '')}
                    </span>
                  </div>

                  <div className="schedule-card-time">
                    {selectedTime} 예상 승객
                    {isLoadingDay ? (
                      <p className="schedule-expired-note">불러오는 중...</p>
                    ) : value === null ? (
                      <p className="schedule-expired-note">해당 시간의 예상 승객 정보가 없습니다.</p>
                    ) : (
                      <div className="schedule-card-metrics">
                        <span className="schedule-pill">{formatNumber(value)}명</span>
                        {!isBest && diff !== null && (
                          <span className="schedule-people">가장 여유로운 장소보다 {formatNumber(diff)}명 많음</span>
                        )}
                      </div>
                    )}
                    {validValues.length > 1 && value !== null && (
                      <p className="favorites-empty-hint">
                        관심 장소 {validValues.length}곳 중 {index + 1}번째로 여유로움
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="schedule-detail-link"
                    onClick={() => setExpandedId(isExpanded ? null : place.id)}
                  >
                    상세 보기 {isExpanded ? '▴' : '▾'}
                  </button>

                  {isExpanded && (
                    <div className="place-detail-panel">
                      <p className="favorites-empty-hint">
                        같은 터미널 다른 출입국장과 비교 ({selectedTime} 기준)
                      </p>
                      <ul className="place-compare-list">
                        {sameTerminalToday.map((entry) => (
                          <li
                            key={entry.place.key}
                            className={entry.place.key === place.placeKey ? 'place-compare-self' : ''}
                          >
                            {entry.place.label}: {formatNumber(entry.value)}명
                          </li>
                        ))}
                      </ul>
                      <p className="favorites-empty-hint">
                        {bestHour
                          ? `오늘 중 가장 여유로운 시간: ${bestHour.time.replace('_', '~')} (${formatNumber(bestHour.value)}명)`
                          : '하루 시간대별 데이터를 확인할 수 없습니다.'}
                      </p>
                    </div>
                  )}
                </div>

                <button type="button" className="btn-delete schedule-delete-btn" onClick={handleDelete}>
                  관심 장소 삭제
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
