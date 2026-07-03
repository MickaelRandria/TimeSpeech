const DAY_SHORT  = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTH_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const MONTH_FULL  = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE']

export interface WeekDay {
  dayLabel: string
  dayNumber: number
  date: string       // ISO yyyy-mm-dd
  isToday?: boolean
}

export function getCurrentWeekDays(): WeekDay[] {
  const today = new Date()
  const dow = today.getDay()
  const daysFromMon = dow === 0 ? 6 : dow - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMon)

  return DAY_SHORT.slice(1).concat(DAY_SHORT[0] /* Sun */).map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      dayLabel:  label,
      dayNumber: d.getDate(),
      date:      d.toISOString().split('T')[0],
      isToday:   d.toDateString() === today.toDateString(),
    }
  })
}

export function getTodayISODate(): string {
  return new Date().toISOString().split('T')[0]
}

// Returns the Thursday of the current week (or today if it IS Thursday)
export function getThisThursday(): Date {
  const today = new Date()
  const dow = today.getDay()
  const daysUntilThu = (4 - dow + 7) % 7
  const thu = new Date(today)
  thu.setDate(today.getDate() + daysUntilThu)
  return thu
}

export function formatShortDate(d: Date): string {
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

// "Jeu 2 juil. · 10h00 – 12h00"
export function getSessionDateLabel(): string {
  return `${formatShortDate(getThisThursday())} · 10h00 – 12h00`
}

// "SEMAINE DU 29 JUIN"
export function getWeekLabel(): string {
  const days = getCurrentWeekDays()
  const mon = new Date(days[0].date + 'T12:00:00')
  return `SEMAINE DU ${mon.getDate()} ${MONTH_FULL[mon.getMonth()]}`
}
