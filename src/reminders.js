import { dayKey, plannedVitamin, VITAMINS } from './lib.js'

const LAST_KEY = 'algae:remind:last'
const MAX_TIMEOUT = 2_147_483_647

let timerId = 0
let getContext = () => ({ settings: null, log: {} })

export function initReminders(ctxFn) {
  getContext = ctxFn
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncReminders()
  })
  window.addEventListener('focus', () => syncReminders())
  syncReminders()
}

export function reminderSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function ensureReminderPermission() {
  if (!reminderSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function syncReminders() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = 0
  }

  const { settings, log } = getContext()
  if (!settings?.remindersEnabled) return
  if (!reminderSupported() || Notification.permission !== 'granted') return

  const remindAt = normalizeTime(settings.remindAt)
  const now = new Date()

  void maybeCatchUp(now, remindAt, settings, log)

  const next = nextFireDate(now, remindAt)
  const delay = Math.max(1_000, Math.min(next.getTime() - now.getTime(), MAX_TIMEOUT))
  timerId = window.setTimeout(() => {
    void fireReminder()
    syncReminders()
  }, delay)
}

function normalizeTime(value) {
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) return value
  return '10:00'
}

function nextFireDate(now, remindAt) {
  const [hh, mm] = remindAt.split(':').map(Number)
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0)
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
  return next
}

function lastNotifiedKey() {
  try {
    return localStorage.getItem(LAST_KEY) || ''
  } catch {
    return ''
  }
}

function markNotified(key) {
  try {
    localStorage.setItem(LAST_KEY, key)
  } catch {
    /* ignore quota */
  }
}

async function maybeCatchUp(now, remindAt, settings, log) {
  const key = dayKey(now)
  if (lastNotifiedKey() === key) return
  if (log?.[key]?.taken) return

  const [hh, mm] = remindAt.split(':').map(Number)
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0)
  if (now.getTime() < due.getTime()) return

  await showReminder(settings, key)
}

async function fireReminder() {
  const { settings, log } = getContext()
  if (!settings?.remindersEnabled) return
  const key = dayKey()
  if (lastNotifiedKey() === key) return
  if (log?.[key]?.taken) return
  await showReminder(settings, key)
}

async function showReminder(settings, key) {
  const vitaminId = plannedVitamin(new Date(), settings)
  const name = VITAMINS[vitaminId]?.name || 'витамин'
  const title = 'Водоросли'
  const body = `Не забудь сегодня принять витамин — ${name}`

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, {
        body,
        tag: 'algae-daily',
        renotify: true,
        icon: './pwa-192x192.png',
        badge: './pwa-192x192.png',
        data: { url: './' },
      })
      markNotified(key)
      return
    }
  } catch {
    /* fall through */
  }

  try {
    new Notification(title, { body, tag: 'algae-daily' })
    markNotified(key)
  } catch {
    /* unsupported */
  }
}
