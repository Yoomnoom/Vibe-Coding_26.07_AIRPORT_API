interface DateTimeSelectorProps {
  selectedDate: string
  selectedTime: string
  availableTimes: string[]
  onChangeDate: (date: string) => void
  onChangeTime: (time: string) => void
}

export function DateTimeSelector({
  selectedDate,
  selectedTime,
  availableTimes,
  onChangeDate,
  onChangeTime,
}: DateTimeSelectorProps) {
  return (
    <div className="datetime-selector">
      <label>
        날짜
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onChangeDate(event.target.value)}
        />
      </label>

      <label>
        시간
        <select
          value={selectedTime}
          onChange={(event) => onChangeTime(event.target.value)}
        >
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
