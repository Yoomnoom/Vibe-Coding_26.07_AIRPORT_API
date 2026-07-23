import { useEffect, useState } from 'react'
import { getPassgrAnncmt } from '../services/airportApi'
import type { PassgrAnncmtItem, SelectDate } from '../types/airportApi'

export function usePassgrAnncmt(selectdate: SelectDate, enabled: boolean) {
  const [data, setData] = useState<PassgrAnncmtItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getPassgrAnncmt(selectdate)
      .then((items) => {
        if (!cancelled) setData(items)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectdate, enabled])

  return { data, isLoading, error }
}
