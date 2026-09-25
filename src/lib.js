export const VITAMINS = {
  spirulina: {
    id: 'spirulina',
    name: 'Спирулина',
    short: 'С',
    hint: 'овальная таблетка',
    emoji: '🌀',
  },
  chlorella: {
    id: 'chlorella',
    name: 'Хлорелла',
    short: 'Х',
    hint: 'круглая таблетка',
    emoji: '🌿',
  },
}

export const ORDER = ['spirulina', 'chlorella']

export function otherVitamin(id) {
  return id === 'spirulina' ? 'chlorella' : 'spirulina'
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dayNumber(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(local.getTime() / 86_400_000)
}

export function addDays(date, delta) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
  return next
}

export function plannedVitamin(date, settings) {
  if (!settings?.anchorDayKey || !settings?.anchorVitamin) return null
  const diff = dayNumber(date) - dayNumber(parseDayKey(settings.anchorDayKey))
  const even = ((diff % 2) + 2) % 2 === 0
  return even ? settings.anchorVitamin : otherVitamin(settings.anchorVitamin)
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function weekdayShort(date) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date)
}
