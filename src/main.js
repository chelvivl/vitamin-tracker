import './style.css'
import {
  VITAMINS,
  ORDER,
  dayKey,
  formatLongDate,
  formatShortDate,
  otherVitamin,
  plannedVitamin,
  weekdayShort,
} from './lib.js'
import {
  bootstrapSettings,
  invertSchedule,
  loadState,
  loggedEntries,
  saveState,
  setTaken,
  streakCount,
  weekStrip,
} from './store.js'

let state = loadState()
let celebrate = false
let draftVitamin = 'spirulina'
let formError = ''

function persist() {
  saveState(state)
}

function setTab(tab) {
  state = { ...state, tab }
  formError = ''
  if (tab === 'history' && state.settings) {
    draftVitamin = plannedVitamin(new Date(), state.settings) || draftVitamin
  }
  persist()
  render()
}

function bump() {
  try {
    navigator.vibrate?.(12)
  } catch {
    /* ignore */
  }
}

function takeToday() {
  if (!state.settings) return
  const key = dayKey()
  const vitamin = plannedVitamin(new Date(), state.settings)
  const already = state.log[key]?.taken
  if (already) {
    state = setTaken(state, key, false)
    celebrate = false
  } else {
    state = setTaken(state, key, true, vitamin)
    celebrate = true
    bump()
    window.setTimeout(() => {
      celebrate = false
      render()
    }, 900)
  }
  persist()
  render()
}

function addHistoryEntry(dateValue, vitamin) {
  if (!dateValue || !vitamin) {
    formError = 'Укажи дату и витамин'
    render()
    return
  }
  const key = dateValue
  state = setTaken(state, key, true, vitamin)
  draftVitamin = vitamin
  formError = ''
  bump()
  persist()
  render()
}

function removeHistoryEntry(key) {
  state = setTaken(state, key, false)
  persist()
  render()
}

function startOnboarding(vitaminId) {
  state = {
    ...state,
    settings: bootstrapSettings(vitaminId),
    tab: 'today',
  }
  draftVitamin = vitaminId
  persist()
  render()
}

function swapSchedule() {
  state = { ...state, settings: invertSchedule(state.settings) }
  persist()
  render()
}

function icon(name) {
  if (name === 'today') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3.5v3M16 3.5v3M4.5 9.5h15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4" y="5" width="16" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 14.2l2 2 4.2-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
  if (name === 'history') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.8v4.4l3 1.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.8 19.2a6.2 6.2 0 0 1 12.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
}

function algaeMark(id) {
  if (id === 'spirulina') {
    return `<svg class="mark-svg" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5EEAD4"/><stop offset="1" stop-color="#0F766E"/></linearGradient></defs><circle cx="40" cy="40" r="30" fill="url(#sg)" opacity=".25"/><path d="M24 48c8-18 24-28 36-26-10 8-16 20-14 34-10-2-18-4-22-8Z" fill="url(#sg)"/><path d="M28 30c6 2 10 8 9 16" fill="none" stroke="#99F6E4" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`
  }
  return `<svg class="mark-svg" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#86EFAC"/><stop offset="1" stop-color="#166534"/></linearGradient></defs><circle cx="40" cy="40" r="30" fill="url(#cg)" opacity=".22"/><circle cx="40" cy="40" r="16" fill="url(#cg)"/><circle cx="40" cy="40" r="6" fill="#DCFCE7" opacity=".85"/><circle cx="28" cy="28" r="5" fill="url(#cg)" opacity=".7"/><circle cx="54" cy="30" r="4" fill="url(#cg)" opacity=".55"/></svg>`
}

function onboarding() {
  return `
    <section class="onboard enter">
      <div class="orb orb-a"></div>
      <div class="orb orb-b"></div>
      <p class="eyebrow">Водоросли</p>
      <h1>Что принимаешь<br/>сегодня?</h1>
      <p class="lead">Дальше приложение само чередует спирулину и хлореллу каждый день.</p>
      <div class="pick-grid">
        ${ORDER.map(
          (id) => `
          <button class="pick-card vitamin-${id}" type="button" data-boot="${id}">
            <span class="pick-visual">${algaeMark(id)}</span>
            <span class="pick-name">${VITAMINS[id].name}</span>
            <span class="pick-hint">${VITAMINS[id].hint}</span>
          </button>`,
        ).join('')}
      </div>
    </section>
  `
}

function screenToday() {
  const today = new Date()
  const vitaminId = plannedVitamin(today, state.settings)
  const vit = VITAMINS[vitaminId]
  const tomorrow = VITAMINS[otherVitamin(vitaminId)]
  const key = dayKey(today)
  const taken = Boolean(state.log[key]?.taken)
  const streak = streakCount(state)
  const week = weekStrip(state)

  return `
    <section class="today-screen vitamin-${vitaminId} ${celebrate ? 'is-celebrate' : ''} enter">
      <div class="ambient" aria-hidden="true">
        <span class="blob b1"></span>
        <span class="blob b2"></span>
        <span class="blob b3"></span>
      </div>

      <header class="top-line">
        <div>
          <p class="eyebrow">${formatLongDate(today)}</p>
          <h1>Сегодня</h1>
        </div>
        <div class="streak ${streak ? 'has' : ''}" title="Серия дней подряд">
          <span class="streak-fire" aria-hidden="true">✦</span>
          <span>${streak}</span>
        </div>
      </header>

      <div class="week" role="list">
        ${week
          .map(
            (d) => `
          <div class="week-day ${d.isToday ? 'is-today' : ''} ${d.taken ? 'is-taken' : ''} vitamin-${d.vitamin || ''}" role="listitem">
            <span class="wd">${weekdayShort(d.date)}</span>
            <span class="dn">${d.date.getDate()}</span>
            <span class="dot">${d.vitamin ? VITAMINS[d.vitamin].short : '·'}</span>
          </div>`,
          )
          .join('')}
      </div>

      <article class="hero-card">
        <div class="hero-visual">${algaeMark(vitaminId)}</div>
        <p class="hero-kicker">${taken ? 'Принято' : 'На сегодня'}</p>
        <h2 class="hero-title">${vit.name}</h2>
        <p class="hero-sub">Завтра — ${tomorrow.name}</p>

        <button class="cta ${taken ? 'is-done' : ''}" type="button" data-action="take" aria-pressed="${taken}">
          <span class="cta-glow" aria-hidden="true"></span>
          <span class="cta-label">${taken ? 'Отменить отметку' : 'Отметить приём'}</span>
          <span class="cta-check" aria-hidden="true"></span>
        </button>
      </article>

      <p class="foot-hint">Чередование: день через день. Расписание можно поправить во вкладке «Ещё».</p>
    </section>
  `
}

function screenHistory() {
  const entries = loggedEntries(state)
  const today = dayKey()
  return `
    <section class="history-screen enter">
      <header class="top-line">
        <div>
          <p class="eyebrow">Журнал</p>
          <h1>История</h1>
        </div>
      </header>

      <form class="add-card" data-form="add-entry">
        <p class="settings-label">Добавить приём</p>
        <label class="field">
          <span>Дата</span>
          <input class="date-input" type="date" name="date" value="${today}" max="${today}" required />
        </label>
        <div class="vit-switch" role="group" aria-label="Витамин">
          ${ORDER.map(
            (id) => `
            <button type="button" class="vit-chip vitamin-${id} ${draftVitamin === id ? 'is-selected' : ''}" data-draft-vitamin="${id}">
              ${VITAMINS[id].name}
            </button>`,
          ).join('')}
        </div>
        ${formError ? `<p class="form-error">${formError}</p>` : ''}
        <button class="cta add-cta" type="submit">Добавить</button>
      </form>

      ${
        entries.length === 0
          ? `<div class="empty-history">
              <p class="empty-title">Пока пусто</p>
              <p class="empty-text">Добавь дату и витамин вручную — или отметь приём на вкладке «Сегодня».</p>
            </div>`
          : `<ul class="history-list">
              ${entries
                .map((d) => {
                  const vit = VITAMINS[d.vitamin]
                  return `
                  <li class="history-item vitamin-${d.vitamin} is-taken">
                    <div class="history-main static-row">
                      <span class="h-date">
                        <strong>${formatShortDate(d.date)}</strong>
                        <span>${weekdayShort(d.date)}${d.key === today ? ' · сегодня' : ''}</span>
                      </span>
                      <span class="h-vit">${vit ? vit.name : '—'}</span>
                    </div>
                    <button class="history-delete" type="button" data-remove-day="${d.key}" aria-label="Удалить">✕</button>
                  </li>`
                })
                .join('')}
            </ul>`
      }
    </section>
  `
}

function screenMore() {
  const todayId = plannedVitamin(new Date(), state.settings)
  const tomorrowId = otherVitamin(todayId)
  return `
    <section class="more-screen enter">
      <header class="top-line">
        <div>
          <p class="eyebrow">Настройки</p>
          <h1>Ещё</h1>
        </div>
      </header>

      <div class="settings-card">
        <p class="settings-label">Сейчас в расписании</p>
        <div class="pair">
          <div class="pair-item vitamin-${todayId}">
            <span>Сегодня</span>
            <strong>${VITAMINS[todayId].name}</strong>
          </div>
          <div class="pair-swap" aria-hidden="true">⇄</div>
          <div class="pair-item vitamin-${tomorrowId}">
            <span>Завтра</span>
            <strong>${VITAMINS[tomorrowId].name}</strong>
          </div>
        </div>
        <button class="ghost-btn" type="button" data-action="swap">
          Поменять местами
        </button>
      </div>

      <div class="settings-card muted-card">
        <p class="settings-label">Как это работает</p>
        <p class="settings-text">Спирулина и хлорелла чередуются каждый день. В истории можно вручную добавить прошлые приёмы.</p>
      </div>
    </section>
  `
}

const TABS = [
  { id: 'today', label: 'Сегодня', icon: 'today' },
  { id: 'history', label: 'История', icon: 'history' },
  { id: 'more', label: 'Ещё', icon: 'more' },
]

function bind() {
  const app = document.querySelector('#app')

  app.querySelectorAll('[data-boot]').forEach((btn) => {
    btn.addEventListener('click', () => startOnboarding(btn.dataset.boot))
  })

  app.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab))
  })

  app.querySelector('[data-action="take"]')?.addEventListener('click', takeToday)
  app.querySelector('[data-action="swap"]')?.addEventListener('click', swapSchedule)

  app.querySelectorAll('[data-draft-vitamin]').forEach((btn) => {
    btn.addEventListener('click', () => {
      draftVitamin = btn.dataset.draftVitamin
      formError = ''
      render()
    })
  })

  app.querySelector('[data-form="add-entry"]')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const dateValue = form.elements.date?.value
    addHistoryEntry(dateValue, draftVitamin)
  })

  app.querySelectorAll('[data-remove-day]').forEach((btn) => {
    btn.addEventListener('click', () => removeHistoryEntry(btn.dataset.removeDay))
  })
}

function render() {
  const app = document.querySelector('#app')
  const ready = Boolean(state.settings)
  const tab = state.tab || 'today'

  if (!ready) {
    app.innerHTML = `<div class="app-shell onboard-shell">${onboarding()}</div>`
    bind()
    return
  }

  const body =
    tab === 'history' ? screenHistory() : tab === 'more' ? screenMore() : screenToday()

  const vitaminId = plannedVitamin(new Date(), state.settings)

  app.innerHTML = `
    <div class="app-shell theme-${vitaminId}">
      <main class="screen">${body}</main>
      <nav class="tabbar" aria-label="Навигация">
        ${TABS.map((t) => {
          const active = tab === t.id
          return `
            <button class="tab ${active ? 'is-active' : ''}" type="button" data-tab="${t.id}" aria-current="${active ? 'page' : 'false'}">
              <span class="tab-icon">${icon(t.icon)}</span>
              <span class="tab-label">${t.label}</span>
            </button>`
        }).join('')}
      </nav>
    </div>
  `
  bind()
}

document.addEventListener(
  'touchmove',
  (e) => {
    if (!e.target.closest?.('.screen, .history-list, .onboard')) e.preventDefault()
  },
  { passive: false },
)

render()

// Keep "today" fresh around midnight if app stays open
setInterval(() => {
  const key = dayKey()
  if (state._paintDay !== key) {
    state._paintDay = key
    render()
  }
}, 60_000)
