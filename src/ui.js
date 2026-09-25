export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SPRING = 'cubic-bezier(.22,1,.36,1)'
const EXIT = 'cubic-bezier(.4,0,.2,1)'

export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}

/** Collapse-in for a freshly inserted list row. */
export function animateRowIn(row) {
  if (reduceMotion) return
  const height = row.offsetHeight
  const { marginBottom } = getComputedStyle(row)
  row.style.overflow = 'hidden'
  const anim = row.animate(
    [
      { height: '0px', marginBottom: '0px', opacity: 0, transform: 'translateY(-4px) scale(.97)' },
      { height: `${height}px`, marginBottom, opacity: 1, transform: 'none' },
    ],
    { duration: 380, easing: SPRING },
  )
  anim.finished.then(() => {
    row.style.overflow = ''
  })
}

/** Soft fade-out without height animation — avoids iOS layout freeze on list updates. */
export function animateRowOut(row) {
  if (!row) return Promise.resolve()
  if (reduceMotion) {
    row.remove()
    return Promise.resolve()
  }
  row.style.pointerEvents = 'none'
  const anim = row.animate(
    [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateX(12px) scale(0.98)' },
    ],
    { duration: 200, easing: EXIT, fill: 'forwards' },
  )
  return Promise.race([anim.finished.catch(() => {}), new Promise((r) => setTimeout(r, 240))]).then(() => {
    row.remove()
  })
}

export function pulse(el) {
  if (reduceMotion || !el) return
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: SPRING },
  )
}

export function crossfade(el) {
  if (reduceMotion || !el) return
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' })
}

export function slideIn(el, direction = 1) {
  if (reduceMotion || !el) return
  el.animate(
    [
      { opacity: 0, transform: `translateX(${18 * direction}px)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 300, easing: SPRING },
  )
}

export function celebrate(card, mark) {
  if (reduceMotion) return
  mark?.animate(
    [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.16) rotate(-5deg)' },
      { transform: 'scale(1) rotate(0deg)' },
    ],
    { duration: 620, easing: SPRING },
  )
  if (!card) return
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  card.append(ripple)
  ripple
    .animate(
      [
        { transform: 'scale(.4)', opacity: 0.5 },
        { transform: 'scale(2.6)', opacity: 0 },
      ],
      { duration: 760, easing: 'ease-out' },
    )
    .finished.then(() => ripple.remove())
}

export function toast(host, message) {
  if (!host) return
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = message
  host.append(el)

  const remove = () => el.remove()
  if (reduceMotion) {
    setTimeout(remove, 1600)
    return
  }

  el.animate(
    [
      { opacity: 0, transform: 'translateY(14px) scale(.96)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 280, easing: SPRING },
  )
  setTimeout(() => {
    el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(8px)' }], {
      duration: 220,
      easing: EXIT,
      fill: 'forwards',
    }).finished.then(remove)
  }, 1500)
}
