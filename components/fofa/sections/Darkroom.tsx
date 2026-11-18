'use client'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'
import { filesToDataUrls } from '../upload'
import type { ResolvedPhoto } from './Moments'

const SHOWN = 3
const STORE = 'fofa-extra-photos'

const THRESHOLD = 90
// Resting poses (x, y, rotation) of the cards in the deck: the ones underneath peek out to the top-right and left.
const POSES = [[0, 0, -1.5], [52, -26, 8], [-46, -14, -9]]

function placeholderBg(i: number): string {
  return `linear-gradient(135deg, hsl(${(335 + i * 9) % 360} 68% ${46 + (i % 3) * 5}%), hsl(${(350 + i * 9) % 360} 70% ${24 + (i % 2) * 6}%))`
}

/** A deck of photos: the top one is draggable left or right, the next ones peek out underneath. */
export default function Darkroom({ photos: base, initial }: { photos: ResolvedPhoto[]; initial: string }) {
  const [extra, setExtra] = useState<ResolvedPhoto[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const photos = [...base, ...extra]
  // The last card of the deck is always the "+" card.
  const n = photos.length + 1
  const [cur, setCur] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0)
  const start = useRef<{ x: number; id: number } | null>(null)
  const deck = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || '[]') as string[]
      if (saved.length) setExtra(saved.map((url) => ({ url, caption: 'Us' })))
    } catch { /* storage unavailable */ }
  }, [])

  const addFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    const urls = await filesToDataUrls(files)
    if (!urls.length) return
    const all = [...extra.map((p) => p.url as string), ...urls]
    setExtra(all.map((url) => ({ url, caption: 'Us' })))
    setCur(base.length + extra.length) // jump to the first newly added photo
    try { localStorage.setItem(STORE, JSON.stringify(all)) } catch { /* too big or blocked: keep in memory only */ }
    if (fileRef.current) fileRef.current.value = ''
  }

  const next = (dir: 1 | -1 = 1) => {
    if (leaving || n < 2) return
    setLeaving(dir)
    window.setTimeout(() => {
      setCur((c) => (c + 1) % n)
      setLeaving(0)
      setDx(0)
    }, 320)
    burstAt(deck.current, 4)
  }
  const prev = () => { if (!leaving && n > 1) setCur((c) => (c - 1 + n) % n) }

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (leaving) return
    start.current = { x: e.clientX, id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (start.current) setDx(e.clientX - start.current.x)
  }
  const up = () => {
    if (!start.current) return
    start.current = null
    setDragging(false)
    if (Math.abs(dx) > THRESHOLD) next(dx > 0 ? 1 : -1)
    else {
      if (Math.abs(dx) < 6 && (cur % n) === n - 1) fileRef.current?.click()
      setDx(0)
    }
  }

  const slots = Array.from({ length: Math.min(SHOWN, n) }, (_, k) => k).reverse()

  return (
    <section className={`${styles.sec} ${styles.darkroom}`} id="together" onKeyDown={(e) => { if (e.key === 'ArrowRight') next(1); if (e.key === 'ArrowLeft') prev() }}>
      <Reveal as="h2" className={styles.h2}><em>Us</em></Reveal>

      <Reveal>
        <div ref={deck} className={styles.deck}>
          {slots.map((k) => {
            const i = (cur + k) % n
            const photo = i === n - 1 ? null : photos[i]
            const top = k === 0
            let style: CSSProperties
            if (top) {
              const x = leaving ? leaving * 520 : dx
              style = { transform: `translateX(${x}px) rotate(${x * 0.035 - 1.5}deg)`, opacity: leaving ? 0 : 1, zIndex: SHOWN + 1 }
            } else {
              const p = POSES[leaving ? k - 1 : k]
              style = { transform: `translate(${p[0]}px, ${p[1]}px) rotate(${p[2]}deg)`, zIndex: SHOWN - k }
            }
            return (
              <div
                key={i}
                className={`${styles.card} ${top ? styles.cardTop : ''} ${top && dragging ? styles.cardDrag : ''}`}
                style={style}
                {...(top ? { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up } : {})}
                aria-hidden={!top}
              >
                <span className={styles.pic}>
                  {!photo ? (
                    <span className={styles.addCard}><span className={styles.addPlus}>+</span><span>Add your photos</span></span>
                  ) : photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt={photo.caption} draggable={false} />
                  ) : (
                    <span className={styles.ph} style={{ background: placeholderBg(i) }}>{initial}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </Reveal>
    </section>
  )
}
