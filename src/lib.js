export const VITAMINS = {
  spirulina: {
    id: 'spirulina',
    name: 'Спирулина',
    short: 'С',
    hint: 'овальная таблетка',
    emoji: '🌀',
    latin: 'Arthrospira platensis',
    tagline: 'Сине-зелёная микроводоросль — плотный источник белка и энергии',
    about:
      'Цианобактерия из щёлочных озёр. Название от спиральной формы нитей. У неё нет жёсткой целлюлозной оболочки, поэтому усваивается легче хлореллы. FDA присвоила статус GRAS — «общепризнана безопасной».',
    composition: [
      { label: 'Белок', value: '55–70%' },
      { label: 'Углеводы', value: '15–25%' },
      { label: 'Жиры', value: '6–9%' },
      { label: 'Минералы', value: '7–13%' },
    ],
    nutrients: [
      'Все незаменимые аминокислоты',
      'Фикоцианин — синий антиоксидант',
      'Железо, кальций, магний, цинк',
      'Витамины B1, B2, B3, B9, провитамин A',
      'Гамма-линоленовая кислота (ГЛК)',
    ],
    benefits: [
      'Поддерживает энергию и мышечную массу за счёт полного белка',
      'Антиоксидантная защита клеток (фикоцианин)',
      'Железо — вклад в профилактику анемии',
      'Мягкая поддержка иммунитета и липидного профиля',
    ],
    tip: 'Обычная доза в исследованиях — около 1–5 г в день. Удобнее утром или днём во время еды.',
  },
  chlorella: {
    id: 'chlorella',
    name: 'Хлорелла',
    short: 'Х',
    hint: 'круглая таблетка',
    emoji: '🌿',
    latin: 'Chlorella vulgaris',
    tagline: 'Зелёная одноклеточная водоросль — хлорофилл и мягкое очищение',
    about:
      'Одна из древнейших одноклеточных зелёных водорослей. Глубокий зелёный цвет даёт хлорофилл (до 3–5% сухого веса). Оболочка из целлюлозы — для усвоения нужна «разбитая» или ферментированная форма (broken cell wall).',
    composition: [
      { label: 'Белок', value: '50–65%' },
      { label: 'Углеводы', value: '~10%+' },
      { label: 'Жиры', value: '~10%+' },
      { label: 'Хлорофилл', value: '3–5%' },
    ],
    nutrients: [
      'Высокий хлорофилл',
      'Железо, цинк, магний',
      'Витамины A, C, E, K и группа B',
      'Фолат; в продуктах — B12 и D2',
      'Омега-3 (α-линоленовая кислота)',
      'CGF — фактор роста хлореллы',
    ],
    benefits: [
      'Поддержка детоксикации и выведения тяжёлых металлов',
      'Больше хлорофилла — «зелёная» поддержка крови и ЖКТ',
      'Иммунная модуляция и антиоксидантный эффект',
      'Полезный белок и микроэлементы для рациона',
    ],
    tip: 'Берите хлореллу с разрушенной клеточной стенкой. Типичная доза — около 3–7 г в день, лучше с едой.',
  },
}

/** Почему чередуют две водоросли — общий блок справки. */
export const GUIDE_PAIR = {
  title: 'Почему через день',
  text: 'Спирулина сильнее в белке, фикоцианине и ГЛК; хлорелла — в хлорофилле, омега-3 и мягком детоксе. Чередование даёт более полный набор нутриентов без дублирования одной добавки каждый день.',
  note: 'Справка носит ознакомительный характер и не заменяет консультацию врача.',
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
