import type { PassgrAnncmtItem } from '../types/airportApi'

interface PassgrAnncmtViewerProps {
  isLoading: boolean
  error: string | null
  data: PassgrAnncmtItem[]
}

export function PassgrAnncmtViewer({ isLoading, error, data }: PassgrAnncmtViewerProps) {
  if (isLoading) return <p>불러오는 중...</p>
  if (error) return <p className="error-message">{error}</p>
  if (data.length === 0) return <p>표시할 데이터가 없습니다.</p>

  return (
    <ul className="passgr-anncmt-list">
      {data.map((item, index) => (
        <li key={index}>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </li>
      ))}
    </ul>
  )
}
