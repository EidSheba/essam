/** Any component can ask the background canvas to burst a few hearts at a screen position. */
export function burstHearts(x: number, y: number, n = 18): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('fofa:burst', { detail: { x, y, n } }))
}

/** Burst at the centre of an element. */
export function burstAt(el: Element | null, n = 12): void {
  if (!el) return
  const r = el.getBoundingClientRect()
  burstHearts(r.left + r.width / 2, r.top + r.height / 2, n)
}
