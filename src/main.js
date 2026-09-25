import './style.css'
import {
  ORDER,
  VITAMINS,
  dayKey,
  formatLongDate,
  formatShortDate,
  otherVitamin,
  parseDayKey,
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
import {
  animateRowIn,
  animateRowOut,
  celebrate,
  crossfade,
  haptic,
  pulse,
  slideIn,
  toast,
} from './ui.js'

const TABS = [
  { id: 'today', label: 'Сегодня' },
  { id: 'history', label: 'История' },
  { id: 'more', label: 'Ещё' },
]

const root = document.querySelector('#app')

let state = loadState()
let draftVitamin = 'spirulina'
let paintedDay = dayKey()

const todayVitamin = () => plannedVitamin(new Date(), state.settings)
const persist = () => saveState(state)
function shell() {
  return root.querySelector('.app')
}

function screen() {
  return root.querySelector('[data-screen]')
}

/* ---------------------------------------------------------------- icons */

const ICONS = {
  today: `<path d="M8 3.5v3M16 3.5v3M4.5 9.6h15" stroke-linecap="round"/><rect x="4" y="5" width="16" height="15" rx="4"/><path d="M9.2 14.4l2 2 3.9-4.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  history: `<circle cx="12" cy="12" r="8.2"/><path d="M12 7.9v4.3l2.9 1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
  more: `<path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h9" stroke-linecap="round"/>`,
  close: `<path d="M7 7l10 10M17 7L7 17" stroke-linecap="round"/>`,
  plus: `<path d="M12 5.5v13M5.5 12h13" stroke-linecap="round"/>`,
}

const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${ICONS[name]}</svg>`

function algaeMark(id) {
  if (id === 'spirulina') {
    return `<svg class="mark" viewBox="0 0 96 96" aria-hidden="true">
      <defs><linearGradient id="gs" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#7FE6D6"/><stop offset="1" stop-color="#0D6F66"/>
      </linearGradient></defs>
      <circle cx="48" cy="48" r="34" fill="url(#gs)" opacity=".16"/>
      <path d="M28 62C36 38 54 26 70 26c-12 11-18 24-16 40-11-1-21-2-26-4Z" fill="url(#gs)"/>
      <path d="M36 42c8 3 12 11 11 20" fill="none" stroke="#DFFBF5" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>
    </svg>`
  }
  return `<svg class="mark" viewBox="0 0 96 96" aria-hidden="true">
    <defs><linearGradient id="gc" x1="0" y1="1" x2="1" y2="0">
      <stop stop-color="#9BE49B"/><stop offset="1" stop-color="#256B30"/>
    </linearGradient></defs>
    <circle cx="48" cy="48" r="34" fill="url(#gc)" opacity=".15"/>
    <circle cx="48" cy="49" r="19" fill="url(#gc)"/>
    <circle cx="48" cy="49" r="7" fill="#EAFBEA" opacity=".9"/>
    <circle cx="32" cy="33" r="6" fill="url(#gc)" opacity=".65"/>
    <circle cx="65" cy="35" r="4.6" fill="url(#gc)" opacity=".5"/>
  </svg>`
}

/* ------------------------------------------------------------ templates */

function onboardingHtml() {
  return `
    <section class="page onboard">
      <div class="glow glow-a" aria-hidden="true"></div>
      <div class="glow glow-b" aria-hidden="true"></div>
      <p class="eyebrow">Водоросли</p>
      <h1 class="display">Что принимаешь<br/>сегодня?</h1>
      <p class="lead">Дальше приложение само чередует спирулину и хлореллу — день через день.</p>
      <div class="pick">
        ${ORDER.map(
          (id) => `
          <button class="pick-card" type="button" data-boot="${id}" data-vitamin="${id}">
            <span class="pick-mark">${algaeMark(id)}</span>
            <span class="pick-text">
              <strong>${VITAMINS[id].name}</strong>
              <span>${VITAMINS[id].hint}</span>
            </span>
            <span class="pick-go" aria-hidden="true">→</span>
          </button>`,
        ).join('')}
      </div>
    </section>
  `
}

function todayHtml() {
  const now = new Date()
  const id = todayVitamin()
  const taken = Boolean(state.log[dayKey(now)]?.taken)
  const streak = streakCount(state)

  return `
    <section class="page today" data-vitamin="${id}">
      <header class="head">
        <div>
          <p class="eyebrow">${formatLongDate(now)}</p>
          <h1 class="display">Сегодня</h1>
        </div>
        <div class="streak ${streak ? 'has' : ''}" title="Дней подряд">
          <span class="streak-dot" aria-hidden="true"></span>
          <span data-streak>${streak}</span>
        </div>
      </header>

      <div class="week" role="list">
        ${weekStrip(state)
          .map(
            (d) => `
          <div class="wk ${d.isToday ? 'is-today' : ''} ${d.taken ? 'is-taken' : ''}"
               data-vitamin="${d.vitamin || ''}" data-key="${d.key}" role="listitem">
            <span class="wk-d">${weekdayShort(d.date)}</span>
            <span class="wk-n">${d.date.getDate()}</span>
            <span class="wk-m">${d.vitamin ? VITAMINS[d.vitamin].short : '·'}</span>
          </div>`,
          )
          .join('')}
      </div>

      <article class="hero ${taken ? 'is-taken' : ''}">
        <div class="hero-mark">${algaeMark(id)}</div>
        <p class="hero-kicker" data-kicker>${taken ? 'Принято' : 'На сегодня'}</p>
        <h2 class="hero-title display">${VITAMINS[id].name}</h2>
        <p class="hero-next">Завтра — ${VITAMINS[otherVitamin(id)].name}</p>
        <button class="btn ${taken ? 'btn-soft' : 'btn-primary'}" type="button"
                data-action="take" aria-pressed="${taken}">
          <span data-cta-label>${taken ? 'Отменить отметку' : 'Отметить приём'}</span>
        </button>
      </article>

      <p class="note">Расписание можно поменять во вкладке «Ещё».</p>
    </section>
  `
}

function logRowHtml(entry) {
  const vit = VITAMINS[entry.vitamin]
  const isToday = entry.key === dayKey()
  return `
    <li class="log-row" data-row="${entry.key}" data-vitamin="${entry.vitamin}">
      <span class="log-badge" aria-hidden="true">${vit?.short || '·'}</span>
      <span class="log-text">
        <strong>${formatShortDate(entry.date)}</strong>
        <span>${weekdayShort(entry.date)}${isToday ? ' · сегодня' : ''}</span>
      </span>
      <span class="log-vit">${vit?.name || '—'}</span>
      <button class="log-del" type="button" data-remove="${entry.key}" aria-label="Удалить запись">
        ${icon('close')}
      </button>
    </li>
  `
}

function emptyLogHtml() {
  return `
    <div class="empty">
      <span class="empty-mark" aria-hidden="true">${algaeMark('spirulina')}</span>
      <p class="empty-title">Журнал пуст</p>
      <p class="empty-text">Добавь дату и витамин выше — или отметь приём на вкладке «Сегодня».</p>
    </div>
  `
}

function historyHtml() {
  const entries = loggedEntries(state)
  const today = dayKey()
  const activeIndex = ORDER.indexOf(draftVitamin)

  return `
    <section class="page history">
      <header class="head">
        <div>
          <p class="eyebrow">Журнал</p>
          <h1 class="display">История</h1>
        </div>
      </header>

      <form class="card add" data-form="add" data-vitamin="${draftVitamin}">
        <div class="field">
          <label class="field-label" for="entry-date">Дата</label>
          <input class="input" id="entry-date" type="date" name="date"
                 value="${today}" max="${today}" required />
        </div>

        <div class="field">
          <span class="field-label">Витамин</span>
          <div class="seg" style="--active:${activeIndex}" role="group" aria-label="Витамин">
            <span class="seg-thumb" aria-hidden="true"></span>
            ${ORDER.map(
              (id) => `
              <button class="seg-btn ${id === draftVitamin ? 'is-active' : ''}" type="button"
                      data-draft="${id}" aria-pressed="${id === draftVitamin}">
                ${VITAMINS[id].name}
              </button>`,
            ).join('')}
          </div>
        </div>

        <button class="btn btn-primary" type="submit">
          ${icon('plus')}<span>Добавить запись</span>
        </button>
      </form>

      <div data-log>
        ${
          entries.length
            ? `<ul class="log">${entries.map(logRowHtml).join('')}</ul>`
            : emptyLogHtml()
        }
      </div>
    </section>
  `
}

function buildLabel() {
  const built = new Date(__BUILD_TIME__)
  if (Number.isNaN(built.getTime())) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(built)
}

function moreHtml() {
  const id = todayVitamin()
  const next = otherVitamin(id)
  return `
    <section class="page more">
      <header class="head">
        <div>
          <p class="eyebrow">Настройки</p>
          <h1 class="display">Ещё</h1>
        </div>
      </header>

      <div class="card">
        <p class="card-label">Расписание</p>
        <div class="pair" data-pair>
          <div class="pair-item" data-vitamin="${id}">
            <span>Сегодня</span><strong>${VITAMINS[id].name}</strong>
          </div>
          <div class="pair-item" data-vitamin="${next}">
            <span>Завтра</span><strong>${VITAMINS[next].name}</strong>
          </div>
        </div>
        <button class="btn btn-soft" type="button" data-action="swap">Поменять местами</button>
      </div>

      <div class="card">
        <p class="card-label">Как это работает</p>
        <p class="card-text">Спирулина и хлорелла идут через день. Пропущенные приёмы можно внести вручную в «Истории».</p>
      </div>

      <div class="card">
        <p class="card-label">О приложении</p>
        <div class="meta">
          <div class="meta-row">
            <span>Версия</span>
            <strong>${__APP_VERSION__}</strong>
          </div>
          <div class="meta-row">
            <span>Сборка</span>
            <strong>${buildLabel()}</strong>
          </div>
        </div>
      </div>
    </section>
  `
}

/* ---------------------------------------------------------------- render */

function screenHtml(tab) {
  if (tab === 'history') return historyHtml()
  if (tab === 'more') return moreHtml()
  return todayHtml()
}

function mount() {
  if (!state.settings) {
    root.innerHTML = `<div class="app app-onboard" data-vitamin="spirulina">
      <div class="status-frost" aria-hidden="true"><div class="status-frost-inner"></div></div>
      ${onboardingHtml()}
    </div>`
    return
  }

  const tab = state.tab || 'today'
  root.innerHTML = `
    <div class="app" data-vitamin="${todayVitamin()}">
      <div class="status-frost" aria-hidden="true"><div class="status-frost-inner"></div></div>
      <main class="screen" data-screen>${screenHtml(tab)}</main>
      <div class="toast-host" data-toasts></div>
      <nav class="tabbar" style="--active:${TABS.findIndex((t) => t.id === tab)}" aria-label="Навигация">
        <span class="tab-pill" aria-hidden="true"></span>
        ${TABS.map(
          (t) => `
          <button class="tab ${t.id === tab ? 'is-active' : ''}" type="button"
                  data-tab="${t.id}" aria-current="${t.id === tab ? 'page' : 'false'}">
            ${icon(t.id)}<span class="tab-label">${t.label}</span>
          </button>`,
        ).join('')}
      </nav>
    </div>
  `
  watchScroll()
}

/** Frost only the status-bar strip while content is scrolled underneath. */
function watchScroll() {
  const view = screen()
  if (!view) return
  // Класс добавится, когда заголовок реально начнет приближаться к острову
  const sync = () => shell()?.classList.toggle('is-scrolled', view.scrollTop > 8)
  view.addEventListener('scroll', sync, { passive: true })
  sync()
}

function switchTab(tab) {
  const current = state.tab || 'today'
  if (tab === current) return

  const direction = TABS.findIndex((t) => t.id === tab) > TABS.findIndex((t) => t.id === current) ? 1 : -1
  state = { ...state, tab }
  if (tab === 'history') draftVitamin = todayVitamin() || draftVitamin
  persist()

  const view = screen()
  view.innerHTML = screenHtml(tab)
  view.scrollTop = 0
  shell()?.classList.remove('is-scrolled')
  slideIn(view.firstElementChild, direction)

  const bar = root.querySelector('.tabbar')
  bar.style.setProperty('--active', String(TABS.findIndex((t) => t.id === tab)))
  bar.querySelectorAll('.tab').forEach((btn) => {
    const active = btn.dataset.tab === tab
    btn.classList.toggle('is-active', active)
    btn.setAttribute('aria-current', active ? 'page' : 'false')
  })
}

/* --------------------------------------------------------------- actions */

function start(vitamin) {
  state = { ...state, settings: bootstrapSettings(vitamin), tab: 'today' }
  draftVitamin = vitamin
  persist()
  mount()
  crossfade(shell())
}

function takeToday() {
  const key = dayKey()
  const taken = !state.log[key]?.taken
  state = taken ? setTaken(state, key, true, todayVitamin()) : setTaken(state, key, false)
  persist()

  const hero = root.querySelector('.hero')
  hero.classList.toggle('is-taken', taken)
  hero.querySelector('[data-kicker]').textContent = taken ? 'Принято' : 'На сегодня'

  const cta = root.querySelector('[data-action="take"]')
  cta.classList.toggle('btn-primary', !taken)
  cta.classList.toggle('btn-soft', taken)
  cta.setAttribute('aria-pressed', String(taken))
  cta.querySelector('[data-cta-label]').textContent = taken ? 'Отменить отметку' : 'Отметить приём'

  const streak = streakCount(state)
  const chip = root.querySelector('.streak')
  chip.classList.toggle('has', streak > 0)
  chip.querySelector('[data-streak]').textContent = String(streak)

  root.querySelector(`.wk[data-key="${key}"]`)?.classList.toggle('is-taken', taken)

  if (taken) {
    haptic()
    celebrate(hero, hero.querySelector('.mark'))
  }
}

function selectDraft(vitamin) {
  if (draftVitamin === vitamin) return
  draftVitamin = vitamin

  const form = root.querySelector('[data-form="add"]')
  form.dataset.vitamin = vitamin
  const seg = form.querySelector('.seg')
  seg.style.setProperty('--active', String(ORDER.indexOf(vitamin)))
  seg.querySelectorAll('.seg-btn').forEach((btn) => {
    const active = btn.dataset.draft === vitamin
    btn.classList.toggle('is-active', active)
    btn.setAttribute('aria-pressed', String(active))
  })
}

function addEntry(form) {
  const key = form.elements.date?.value
  if (!key) return

  const existed = Boolean(state.log[key]?.taken)
  state = setTaken(state, key, true, draftVitamin)
  persist()
  haptic()

  const host = root.querySelector('[data-log]')
  const entry = { key, date: parseDayKey(key), vitamin: draftVitamin }

  if (existed) {
    const row = host.querySelector(`[data-row="${key}"]`)
    row.outerHTML = logRowHtml(entry)
    pulse(host.querySelector(`[data-row="${key}"]`))
    notify('Запись обновлена')
    return
  }

  let list = host.querySelector('.log')
  if (!list) {
    host.innerHTML = '<ul class="log"></ul>'
    list = host.querySelector('.log')
    crossfade(list)
  }

  const template = document.createElement('template')
  template.innerHTML = logRowHtml(entry).trim()
  const node = template.content.firstElementChild
  const before = [...list.children].find((child) => child.dataset.row < key)
  list.insertBefore(node, before || null)
  animateRowIn(node)
  notify('Добавлено')
}

function removeEntry(key) {
  const row = root.querySelector(`[data-row="${key}"]`)
  if (!row) return
  state = setTaken(state, key, false)
  persist()
  haptic(8)

  animateRowOut(row).then(() => {
    const host = root.querySelector('[data-log]')
    if (host && !host.querySelector('.log-row')) {
      host.innerHTML = emptyLogHtml()
      crossfade(host.firstElementChild)
    }
  })
}

function swapSchedule() {
  state = { ...state, settings: invertSchedule(state.settings) }
  persist()
  haptic()

  const id = todayVitamin()
  shell().dataset.vitamin = id

  const pair = root.querySelector('[data-pair]')
  const next = otherVitamin(id)
  pair.innerHTML = `
    <div class="pair-item" data-vitamin="${id}"><span>Сегодня</span><strong>${VITAMINS[id].name}</strong></div>
    <div class="pair-item" data-vitamin="${next}"><span>Завтра</span><strong>${VITAMINS[next].name}</strong></div>
  `
  crossfade(pair)
}

function notify(message) {
  toast(root.querySelector('[data-toasts]'), message)
}

/* -------------------------------------------------------------- bindings */

root.addEventListener('click', (event) => {
  const target = event.target
  const hit = (selector) => target.closest(selector)

  const boot = hit('[data-boot]')
  if (boot) return start(boot.dataset.boot)

  const tab = hit('[data-tab]')
  if (tab) return switchTab(tab.dataset.tab)

  if (hit('[data-action="take"]')) return takeToday()
  if (hit('[data-action="swap"]')) return swapSchedule()

  const draft = hit('[data-draft]')
  if (draft) return selectDraft(draft.dataset.draft)

  const remove = hit('[data-remove]')
  if (remove) return removeEntry(remove.dataset.remove)
})

root.addEventListener('submit', (event) => {
  if (!event.target.matches('[data-form="add"]')) return
  event.preventDefault()
  addEntry(event.target)
})

/*
 * An installed PWA keeps running the build it was launched with, so a deploy
 * stays invisible until the page navigates again. Reload as soon as a newer
 * service worker takes over, and look for one every time the app is reopened.
 */
function watchForUpdates() {
  if (!('serviceWorker' in navigator)) return

  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })

  const check = () =>
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.update())
      .catch(() => {})

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check()
  })
  check()
}

// Block rubber-banding outside the scrollable screen, keep native scroll inside.
document.addEventListener(
  'touchmove',
  (event) => {
    if (!event.target.closest?.('.screen, .onboard')) event.preventDefault()
  },
  { passive: false },
)

mount()
watchForUpdates()

const paintRoot = () => {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0b1310'
  document.documentElement.style.backgroundColor = color
  document.body.style.backgroundColor = color
}
paintRoot()
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintRoot)

setInterval(() => {
  const key = dayKey()
  if (key === paintedDay) return
  paintedDay = key
  if ((state.tab || 'today') === 'today') {
    const view = screen()
    if (view) {
      view.innerHTML = screenHtml('today')
      crossfade(view.firstElementChild)
    }
  }
}, 60_000)
