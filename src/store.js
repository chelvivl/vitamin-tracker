import { dayKey, dayNumber, otherVitamin, parseDayKey, plannedVitamin } from './lib.js'

const KEY = 'algae:v1'

const defaultState = () => ({
  settings: null,
  log: {},
  tab: 'today',
})

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!raw || typeof raw !== 'object') return defaultState()
    return {
      settings: raw.settings ?? null,
      log: raw.log && typeof raw.log === 'object' ? raw.log : {},
      tab: raw.tab || 'today',
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      settings: state.settings,
      log: state.log,
      tab: state.tab,
    }),
  )
}

export function bootstrapSettings(vitaminId) {
  return {
    anchorDayKey: dayKey(),
    anchorVitamin: vitaminId,
  }
}

export function invertSchedule(settings) {
  if (!settings) return null
  return {
    ...settings,
    anchorVitamin: otherVitamin(settings.anchorVitamin),
  }
}

export function entryFor(state, key) {
  const planned = plannedVitamin(parseDayKey(key), state.settings)
  const entry = state.log[key]
  if (!entry) {
    return {
      key,
      vitamin: planned,
      taken: false,
      planned: true,
      at: null,
    }
  }
  return {
    key,
    vitamin: entry.vitamin || planned,
    taken: Boolean(entry.taken),
    planned: !entry.vitamin || entry.vitamin === planned,
    at: entry.at || null,
  }
}

export function setTaken(state, key, taken, vitamin) {
  const next = { ...state, log: { ...state.log } }
  if (!taken) {
    delete next.log[key]
  } else {
    next.log[key] = {
      vitamin,
      taken: true,
      at: new Date().toISOString(),
    }
  }
  return next
}

export function streakCount(state) {
  if (!state.settings) return 0
  let streak = 0
  let cursor = new Date()
  if (!entryFor(state, dayKey(cursor)).taken) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
  }
  for (let i = 0; i < 365; i++) {
    const key = dayKey(cursor)
    if (!entryFor(state, key).taken) break
    streak += 1
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
  }
  return streak
}

export function recentDays(state, count = 21) {
  const days = []
  const start = new Date()
  for (let i = 0; i < count; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() - i)
    const key = dayKey(date)
    days.push({ date, ...entryFor(state, key) })
  }
  return days
}

export function weekStrip(state) {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const key = dayKey(date)
    return {
      date,
      key,
      isToday: key === dayKey(today),
      ...entryFor(state, key),
    }
  })
}

export { dayNumber }
