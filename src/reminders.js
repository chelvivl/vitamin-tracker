import { dayKey, plannedVitamin, VITAMINS } from './lib.js'

const LAST_KEY = 'algae:remind:last'
const MAX_TIMEOUT = 2_147_483_647

let timerId = 0
let tickId = 0
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

export function reminderPermission() {
  if (!reminderSupported()) return 'unsupported'
  return Notification.permission
}

export async function ensureReminderPermission() {
  if (!reminderSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

/** Сброс «уже напомнили сегодня», если новое время ещё впереди. */
export function armReminderForToday(remindAt) {
  const now = new Date()
  const key = dayKey(now)
  const [hh, mm] = normalizeTime(remindAt).split(':').map(Number)
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0)
  if (due.getTime() > now.getTime() && lastNotifiedKey() === key) {
    try {
      localStorage.removeItem(LAST_KEY)
    } catch {
      /* ignore */
    }
  }
}

export function nextReminderLabel(settings) {
  if (!settings?.remindersEnabled) return ''
  const remindAt = normalizeTime(settings.remindAt)
  const next = nextFireDate(new Date(), remindAt)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(next)
}

export function syncReminders() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = 0
  }
  if (tickId) {
    clearInterval(tickId)
    tickId = 0
  }

  const { settings, log } = getContext()
  if (!settings?.remindersEnabled) return
  if (!reminderSupported() || Notification.permission !== 'granted') return

  const remindAt = normalizeTime(settings.remindAt)
  const now = new Date()

  void checkDue(now, remindAt, settings, log)

  const next = nextFireDate(now, remindAt)
  const delay = Math.max(500, Math.min(next.getTime() - now.getTime(), MAX_TIMEOUT))
  timerId = window.setTimeout(() => {
    void checkDue(new Date(), remindAt, settings, log)
    syncReminders()
  }, delay)

  // Пока экран открыт — подстраховка раз в 15 с (iOS любит тормозить длинный setTimeout)
  tickId = window.setInterval(() => {
    if (document.hidden) return
    const ctx = getContext()
    if (!ctx.settings?.remindersEnabled) return
    void checkDue(
      new Date(),
      normalizeTime(ctx.settings.remindAt),
      ctx.settings,
      ctx.log,
    )
  }, 15_000)
}

export async function sendTestReminder() {
  const ok = await ensureReminderPermission()
  if (!ok) return { ok: false, reason: 'permission' }
  const { settings } = getContext()
  const vitaminId = plannedVitamin(new Date(), settings)
  const name = VITAMINS[vitaminId]?.name || 'витамин'
  const shown = await showNotification(
    'Водоросли',
    `Не забудь сегодня принять витамин — ${name}`,
  )
  return { ok: shown, reason: shown ? '' : 'show' }
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

async function checkDue(now, remindAt, settings, log) {
  const key = dayKey(now)
  if (lastNotifiedKey() === key) return
  if (log?.[key]?.taken) return

  const [hh, mm] = remindAt.split(':').map(Number)
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0)
  if (now.getTime() < due.getTime()) return

  const vitaminId = plannedVitamin(now, settings)
  const name = VITAMINS[vitaminId]?.name || 'витамин'
  const shown = await showNotification(
    'Водоросли',
    `Не забудь сегодня принять витамин — ${name}`,
  )
  if (shown) markNotified(key)
}

async function showNotification(title, body) {
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
      return true
    }
  } catch {
    /* fall through */
  }

  try {
    new Notification(title, { body, tag: 'algae-daily' })
    return true
  } catch {
    return false
  }
}
