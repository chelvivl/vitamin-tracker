import './style.css'

const STORAGE_KEY = 'vt:taken'
const TAB_KEY = 'vt:tab'

const ITEMS = [
  { id: 'd3', name: 'Витамин D3', time: 'Утро', slot: 'morning' },
  { id: 'omega', name: 'Омега-3', time: 'Обед', slot: 'day' },
  { id: 'mag', name: 'Магний', time: 'Вечер', slot: 'evening' },
]

const TABS = [
  { id: 'today', label: 'Сегодня', icon: 'today' },
  { id: 'list', label: 'Список', icon: 'list' },
  { id: 'more', label: 'Ещё', icon: 'more' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function loadTaken() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return raw.day === todayKey() ? new Set(raw.ids || []) : new Set()
  } catch {
    return new Set()
  }
}

function saveTaken(taken) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ day: todayKey(), ids: [...taken] }),
  )
}

function dateLabel() {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function icon(name, active) {
  const stroke = active ? 'currentColor' : 'currentColor'
  if (name === 'today') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3" fill="none" stroke="${stroke}" stroke-width="1.8"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="14.5" r="1.6" fill="${stroke}"/></svg>`
  }
  if (name === 'list') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7h10M9 12h10M9 17h10" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/><circle cx="5.5" cy="7" r="1.3" fill="${stroke}"/><circle cx="5.5" cy="12" r="1.3" fill="${stroke}"/><circle cx="5.5" cy="17" r="1.3" fill="${stroke}"/></svg>`
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6.5" cy="12" r="1.5" fill="${stroke}"/><circle cx="12" cy="12" r="1.5" fill="${stroke}"/><circle cx="17.5" cy="12" r="1.5" fill="${stroke}"/></svg>`
}

let taken = loadTaken()
let tab = localStorage.getItem(TAB_KEY) || 'today'

function setTab(next) {
  tab = next
  localStorage.setItem(TAB_KEY, tab)
  render()
}

function toggleItem(id) {
  if (taken.has(id)) taken.delete(id)
  else taken.add(id)
  saveTaken(taken)
  render()
}

function progress() {
  const total = ITEMS.length
  const done = ITEMS.filter((i) => taken.has(i.id)).length
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

function screenToday() {
  const { done, total, pct } = progress()
  return `
    <header class="nav-header">
      <div class="nav-header-text">
        <p class="kicker">${dateLabel()}</p>
        <h1>Сегодня</h1>
      </div>
      <div class="ring" style="--p:${pct}" aria-label="Выполнено ${done} из ${total}">
        <span>${done}/${total}</span>
      </div>
    </header>
    <section class="content">
      <ul class="rows" role="list">
        ${ITEMS.map((item) => {
          const on = taken.has(item.id)
          return `
            <li>
              <button class="row ${on ? 'is-done' : ''}" type="button" data-id="${item.id}" aria-pressed="${on}">
                <span class="check" aria-hidden="true"></span>
                <span class="row-body">
                  <span class="title">${item.name}</span>
                  <span class="subtitle">${item.time}</span>
                </span>
              </button>
            </li>`
        }).join('')}
      </ul>
    </section>
  `
}

function screenList() {
  return `
    <header class="nav-header">
      <div class="nav-header-text">
        <p class="kicker">Каталог</p>
        <h1>Список</h1>
      </div>
    </header>
    <section class="content">
      <ul class="rows" role="list">
        ${ITEMS.map(
          (item) => `
          <li>
            <div class="row static">
              <span class="dot" aria-hidden="true"></span>
              <span class="row-body">
                <span class="title">${item.name}</span>
                <span class="subtitle">Приём: ${item.time.toLowerCase()}</span>
              </span>
            </div>
          </li>`,
        ).join('')}
      </ul>
      <p class="empty-note">Редактирование добавим по ТЗ</p>
    </section>
  `
}

function screenMore() {
  return `
    <header class="nav-header">
      <div class="nav-header-text">
        <p class="kicker">Приложение</p>
        <h1>Ещё</h1>
      </div>
    </header>
    <section class="content">
      <ul class="rows grouped" role="list">
        <li><div class="row static"><span class="row-body"><span class="title">Напоминания</span><span class="subtitle">Скоро</span></span></div></li>
        <li><div class="row static"><span class="row-body"><span class="title">История</span><span class="subtitle">Скоро</span></span></div></li>
        <li><div class="row static"><span class="row-body"><span class="title">О приложении</span><span class="subtitle">Vitamin Tracker 0.1</span></span></div></li>
      </ul>
    </section>
  `
}

function render() {
  const app = document.querySelector('#app')
  const body =
    tab === 'list' ? screenList() : tab === 'more' ? screenMore() : screenToday()

  app.innerHTML = `
    <div class="app-shell">
      <main class="screen" id="screen">${body}</main>
      <nav class="tabbar" aria-label="Навигация">
        ${TABS.map((t) => {
          const active = tab === t.id
          return `
            <button class="tab ${active ? 'is-active' : ''}" type="button" data-tab="${t.id}" aria-current="${active ? 'page' : 'false'}">
              <span class="tab-icon">${icon(t.icon, active)}</span>
              <span class="tab-label">${t.label}</span>
            </button>`
        }).join('')}
      </nav>
    </div>
  `

  app.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab))
  })

  app.querySelectorAll('.row[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => toggleItem(btn.dataset.id))
  })
}

function hardenTouch() {
  document.addEventListener(
    'touchmove',
    (e) => {
      if (!e.target.closest?.('.screen')) e.preventDefault()
    },
    { passive: false },
  )
}

hardenTouch()
render()
