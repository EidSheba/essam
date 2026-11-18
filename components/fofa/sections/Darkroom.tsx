'use client'
import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'
import type { ResolvedPhoto } from './Moments'

const SHOWN = 3
const THRESHOLD = 90
// Resting poses (x, y, rotation) of the cards in the deck: the ones underneath peek out to the top-right and left.
const POSES = [[0, 0, -1.5], [52, -26, 8], [-46, -14, -9]]

function placeholderBg(i: number): string {
  return `linear-gradient(135deg, hsl(${(335 + i * 9) % 360} 68% ${46 + (i % 3) * 5}%), hsl(${(350 + i * 9) % 360} 70% ${24 + (i % 2) * 6}%))`
}

/** A deck of photos: the top one is draggable left or right, the next ones peek out underneath. */
export default function Darkroom({ photos, initial }: { photos: ResolvedPhoto[]; initial: string }) {
  const n = photos.length
  const [cur, setCur] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0)
  const start = useRef<{ x: number; id: number } | null>(null)
  const deck = useRef<HTMLDivElement>(null)

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
    else setDx(0)
  }

  const slots = Array.from({ length: Math.min(SHOWN, n) }, (_, k) => k).reverse()

  return (
    <section className={`${styles.sec} ${styles.darkroom}`} id="together" onKeyDown={(e) => { if (e.key === 'ArrowRight') next(1); if (e.key === 'ArrowLeft') prev() }}>
      <Reveal as="h2" className={styles.h2}><em>Us</em></Reveal>

      <Reveal>
        <div ref={deck} className={styles.deck}>
          {slots.map((k) => {
            const i = (cur + k) % n
            const photo = photos[i]
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
                  {photo.url ? (
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
      </Reveal>
    </section>
  )
}
