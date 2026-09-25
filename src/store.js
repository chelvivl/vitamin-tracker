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
      settings: normalizeSettings(raw.settings ?? null),
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

export function normalizeSettings(settings) {
  if (!settings || typeof settings !== 'object') return null
  return {
    anchorDayKey: settings.anchorDayKey,
    anchorVitamin: settings.anchorVitamin,
  }
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

export function loggedEntries(state) {
  return Object.entries(state.log || {})
    .filter(([, entry]) => entry?.taken)
    .map(([key, entry]) => ({
      key,
      date: parseDayKey(key),
      vitamin: entry.vitamin,
      at: entry.at || null,
    }))
    .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0))
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
