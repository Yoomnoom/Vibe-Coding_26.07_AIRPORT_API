import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { CongestionDetailCard } from './components/CongestionDetailCard'
import { CongestionHeatmap } from './components/CongestionHeatmap'
import { CongestionTrendChart } from './components/CongestionTrendChart'
import { FavoritesList } from './components/FavoritesList'
import { RecommendationBanner } from './components/RecommendationBanner'
import { Header } from './components/Header'
import { HeaderAuth } from './components/HeaderAuth'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import { usePassgrAnncmt } from './hooks/usePassgrAnncmt'
import { PassgrAnncmtViewer } from './components/PassgrAnncmtViewer'
import { addFavorite, getFavorites, removeFavorite } from './services/favoritesService'
import {
  TODAY_DATE,
  TOMORROW_DATE,
  getAvailableTimes,
  getCongestionAt,
  getCurrentTimeSlot,
  getTodayCongestion,
  getTomorrowCongestion,
} from './services/congestionService'
import type { CongestionRecord, DayKind, FavoriteItem, Zone } from './types/congestion'

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { user, isLoggedIn, isLoading: isAuthLoading, signIn, signUp, signOut } = useAuth()

  const [selectedDay, setSelectedDay] = useState<DayKind>('today')
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE)
  const [selectedTime, setSelectedTime] = useState(getCurrentTimeSlot())
  const [selectedZone, setSelectedZone] = useState<Zone>('출국장')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date())

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  const [showPassgrAnncmtTest, setShowPassgrAnncmtTest] = useState(false)

  const dayRecords = useMemo(
    () => (selectedDay === 'today' ? getTodayCongestion() : getTomorrowCongestion()),
    [selectedDay],
  )

  const detailRecords = useMemo(
    () => getCongestionAt(selectedDate, selectedTime),
    [selectedDate, selectedTime],
  )

  const {
    data: passgrAnncmtData,
    isLoading: isPassgrAnncmtLoading,
    error: passgrAnncmtError,
  } = usePassgrAnncmt(selectedDay === 'today' ? 0 : 1, showPassgrAnncmtTest)

  function handleSelectDay(day: DayKind) {
    setSelectedDay(day)
    if (day === 'today') {
      setSelectedDate(TODAY_DATE)
      setIsLiveMode(true)
      setSelectedTime(getCurrentTimeSlot())
    } else {
      setSelectedDate(TOMORROW_DATE)
      setIsLiveMode(false)
    }
  }

  function handleRefresh() {
    // TODO: 실제 연동 시 공공데이터포털 API 재조회로 교체
    setLastRefreshedAt(new Date())
    if (selectedDay === 'today') {
      setIsLiveMode(true)
      setSelectedTime(getCurrentTimeSlot())
    }
  }

  function handleGoLive() {
    setSelectedDay('today')
    setSelectedDate(TODAY_DATE)
    setIsLiveMode(true)
    setSelectedTime(getCurrentTimeSlot())
  }

  function handleChangeDate(date: string) {
    setIsLiveMode(false)
    setSelectedDate(date)
  }

  function handleChangeTime(time: string) {
    setIsLiveMode(false)
    setSelectedTime(time)
  }

  // 실시간 모드일 때 5분마다 현재 시각으로 갱신
  useEffect(() => {
    if (!isLiveMode || selectedDay !== 'today') return
    const interval = setInterval(() => {
      setSelectedTime(getCurrentTimeSlot())
      setLastRefreshedAt(new Date())
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isLiveMode, selectedDay])

  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setFavorites([])
      return
    }
    getFavorites(user.id)
      .then(setFavorites)
      .catch((err: Error) => setFavoritesError(err.message))
  }, [user])

  async function handleAddFavorite(record: CongestionRecord) {
    if (!user) return
    setFavoritesError(null)
    try {
      await addFavorite(user.id, {
        terminal: record.terminal,
        zone: record.zone,
        targetDate: record.date,
        targetTime: record.time,
      })
      setFavorites(await getFavorites(user.id))
    } catch (err) {
      setFavoritesError((err as Error).message)
    }
  }

  async function handleRemoveFavorite(id: string) {
    if (!user) return
    setFavoritesError(null)
    try {
      await removeFavorite(id)
      setFavorites(await getFavorites(user.id))
    } catch (err) {
      setFavoritesError((err as Error).message)
    }
  }

  function handleSelectFavorite(favorite: FavoriteItem) {
    setSelectedDay(favorite.targetDate === TOMORROW_DATE ? 'tomorrow' : 'today')
    setSelectedDate(favorite.targetDate)
    setIsLiveMode(false)
    setSelectedTime(favorite.targetTime)
  }

  return (
    <div className="app">
      <Header
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
        onRefresh={handleRefresh}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        authSlot={
          <HeaderAuth
            user={user}
            isLoading={isAuthLoading}
            onSignIn={signIn}
            onSignUp={signUp}
            onSignOut={signOut}
          />
        }
      />

      <div className="app-body">
        <main className="app-main">
          <FavoritesList
            isLoggedIn={isLoggedIn}
            favorites={favorites}
            error={favoritesError}
            onSelectFavorite={handleSelectFavorite}
            onRemoveFavorite={handleRemoveFavorite}
          />

          <CongestionDetailCard
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={getAvailableTimes()}
            onChangeDate={handleChangeDate}
            onChangeTime={handleChangeTime}
            records={detailRecords}
            isLoggedIn={isLoggedIn}
            onAddFavorite={handleAddFavorite}
            isLiveMode={isLiveMode}
            onGoLive={handleGoLive}
            lastRefreshedAt={lastRefreshedAt}
          />

          <RecommendationBanner
            dayRecords={dayRecords}
            zone={selectedZone}
            onSelectTime={handleChangeTime}
          />

          <CongestionHeatmap
            dayRecords={dayRecords}
            selectedTime={selectedTime}
            onSelectTime={handleChangeTime}
          />

          <CongestionTrendChart
            dayRecords={dayRecords}
            zone={selectedZone}
            onChangeZone={setSelectedZone}
            selectedTime={selectedTime}
            isDarkMode={isDarkMode}
          />

          <section className="passgr-anncmt-section">
            <button
              type="button"
              className="passgr-anncmt-toggle"
              onClick={() => setShowPassgrAnncmtTest((prev) => !prev)}
            >
              {showPassgrAnncmtTest ? '실시간 API 연동 테스트 숨기기' : '실시간 API 연동 테스트 (getPassgrAnncmt)'}
            </button>
            {showPassgrAnncmtTest && (
              <PassgrAnncmtViewer
                isLoading={isPassgrAnncmtLoading}
                error={passgrAnncmtError}
                data={passgrAnncmtData}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
