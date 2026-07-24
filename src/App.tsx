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
import {
  addInterestPlace,
  getInterestPlaces,
  removeInterestPlace,
} from './services/favoritesService'
import {
  TODAY_DATE,
  TOMORROW_DATE,
  getAvailableTimes,
  getCongestionAt,
  getCurrentTimeSlot,
  getTodayCongestion,
  getTomorrowCongestion,
} from './services/congestionService'
import type { DayKind, InterestPlace, NewInterestPlaceInput, Zone } from './types/congestion'

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { user, isLoggedIn, isLoading: isAuthLoading, signIn, signUp, signOut } = useAuth()

  const [selectedDay, setSelectedDay] = useState<DayKind>('today')
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE)
  const [selectedTime, setSelectedTime] = useState(getCurrentTimeSlot())
  const [selectedZone, setSelectedZone] = useState<Zone>('출국장')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date())
  const [refreshSignal, setRefreshSignal] = useState(0)

  const [places, setPlaces] = useState<InterestPlace[]>([])
  const [placeFeedback, setPlaceFeedback] = useState<string | null>(null)
  const [loginPromptSignal, setLoginPromptSignal] = useState(0)

  const [showPassgrAnncmtTest, setShowPassgrAnncmtTest] = useState(false)

  function showPlaceFeedback(message: string) {
    setPlaceFeedback(message)
    setTimeout(() => setPlaceFeedback((current) => (current === message ? null : current)), 3000)
  }

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
    setLastRefreshedAt(new Date())
    setRefreshSignal((prev) => prev + 1)
    if (selectedDay === 'today') {
      setIsLiveMode(true)
      setSelectedTime(getCurrentTimeSlot())
    }
    showPlaceFeedback('혼잡도 정보를 새로고침했습니다.')
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

  const [placesError, setPlacesError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setPlaces([])
      return
    }
    getInterestPlaces(user.id)
      .then(setPlaces)
      .catch((err: Error) => setPlacesError(err.message))
  }, [user])

  function isDuplicatePlace(placeKey: string) {
    return places.some((place) => place.placeKey === placeKey)
  }

  async function handleAddPlace(input: NewInterestPlaceInput) {
    if (!user) {
      showPlaceFeedback('관심 출입국장을 저장하려면 로그인이 필요합니다.')
      setLoginPromptSignal((prev) => prev + 1)
      return
    }
    if (isDuplicatePlace(input.placeKey)) {
      showPlaceFeedback('이미 저장된 관심 출입국장입니다.')
      return
    }
    setPlacesError(null)
    try {
      await addInterestPlace(user.id, input)
      setPlaces(await getInterestPlaces(user.id))
      showPlaceFeedback('관심 출입국장을 저장했습니다.')
    } catch (err) {
      setPlacesError((err as Error).message)
    }
  }

  async function handleRemovePlace(id: string) {
    if (!user) return
    setPlacesError(null)
    try {
      await removeInterestPlace(id)
      setPlaces(await getInterestPlaces(user.id))
      showPlaceFeedback('관심 출입국장을 삭제했습니다.')
    } catch (err) {
      setPlacesError((err as Error).message)
    }
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
            openSignal={loginPromptSignal}
          />
        }
      />

      <div className="app-body">
        <main className="app-main">
          {placeFeedback && <div className="schedule-toast">{placeFeedback}</div>}

          <div className="top-row">
            <FavoritesList
              isLoggedIn={isLoggedIn}
              places={places}
              error={placesError}
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              refreshSignal={refreshSignal}
              onAddPlace={handleAddPlace}
              onRemovePlace={handleRemovePlace}
            />

            <RecommendationBanner
              dayRecords={dayRecords}
              zone={selectedZone}
              onSelectTime={handleChangeTime}
            />
          </div>

          <CongestionDetailCard
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={getAvailableTimes()}
            onChangeDate={handleChangeDate}
            onChangeTime={handleChangeTime}
            records={detailRecords}
            isLiveMode={isLiveMode}
            onGoLive={handleGoLive}
            lastRefreshedAt={lastRefreshedAt}
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
