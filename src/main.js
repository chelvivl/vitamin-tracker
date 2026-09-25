import './style.css'

const PLACEHOLDER_ITEMS = [
  { id: 'd3', name: 'Витамин D3', time: 'утро' },
  { id: 'omega', name: 'Омега-3', time: 'обед' },
  { id: 'mag', name: 'Магний', time: 'вечер' },
]

function todayLabel() {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function render() {
  const app = document.querySelector('#app')
  const dateText = todayLabel()

  app.innerHTML = `
    <div class="shell">
      <header class="top">
        <p class="eyebrow">Vitamin Tracker</p>
        <h1>Сегодня</h1>
        <p class="date">${dateText}</p>
      </header>

      <main class="panel">
        <div class="panel-head">
          <h2>Приём</h2>
          <span class="badge">заготовка</span>
        </div>
        <ul class="list" role="list">
          ${PLACEHOLDER_ITEMS.map(
            (item) => `
            <li class="row">
              <button class="check" type="button" aria-pressed="false" aria-label="Отметить ${item.name}"></button>
              <div class="row-text">
                <span class="name">${item.name}</span>
                <span class="meta">${item.time}</span>
              </div>
            </li>`
          ).join('')}
        </ul>
        <p class="hint">Список и логика появятся после ТЗ. Пока это каркас PWA.</p>
      </main>

      <footer class="foot">
        <p>Можно установить на домашний экран телефона после публикации.</p>
      </footer>
    </div>
  `

  app.querySelectorAll('.check').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true'
      btn.setAttribute('aria-pressed', String(!pressed))
      btn.closest('.row')?.classList.toggle('done', !pressed)
    })
  })
}

render()
