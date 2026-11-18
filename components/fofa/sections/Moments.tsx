'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent, KeyboardEvent } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'

export interface ResolvedPhoto { url: string | null; caption: string; date?: string }

interface Item { x: number; y: number; r: number; z: number; flipped: boolean; held: boolean }

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export default function Moments({ photos }: { photos: ResolvedPhoto[] }) {
  const tableRef = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const topZ = useRef(10)
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const [pw, setPw] = useState(200)
  const [height, setHeight] = useState(520)
  const [items, setItems] = useState<Item[]>(() => photos.map((_, i) => ({ x: 0, y: 0, r: 0, z: i + 1, flipped: false, held: false })))

  const layout = useCallback(() => {
    const W = tableRef.current?.clientWidth ?? 800
    const cols = W < 640 ? 2 : 3
    const width = W < 640 ? Math.min(168, W / cols - 16) : 224
    const ph = width * 1.22
    const rows = Math.ceil(photos.length / cols)
    setPw(width)
    setHeight(rows * (ph + 30) + 30)
    setItems((prev) => prev.map((it, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      return { ...it, flipped: false, x: (c + 0.5) * (W / cols) - width / 2 + rand(-16, 16), y: 10 + r * (ph + 30) + rand(-8, 8), r: rand(-9, 9) }
    }))
  }, [photos.length])

  useEffect(() => {
    layout()
    let t: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(t); t = setTimeout(layout, 200) }
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize) }
  }, [layout])

  const patch = (i: number, p: Partial<Item>) => setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...p } : it)))

  const down = (i: number, e: PointerEvent<HTMLDivElement>) => {
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: items[i].x, oy: items[i].y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    topZ.current += 1
    patch(i, { held: true, z: topZ.current })
  }

  const move = (i: number, e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.i !== i) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true
    const table = tableRef.current
    const W = table?.clientWidth ?? 800
    const el = refs.current[i]
    const w = el?.offsetWidth ?? pw
    const h = el?.offsetHeight ?? pw * 1.22
    patch(i, {
      x: Math.max(-w * 0.3, Math.min(W - w * 0.7, d.ox + dx)),
      y: Math.max(-20, Math.min((table?.clientHeight ?? 600) - h * 0.6, d.oy + dy)),
    })
  }

  const up = (i: number) => {
    const d = drag.current
    if (!d || d.i !== i) return
    if (!d.moved) {
      patch(i, { held: false, flipped: !items[i].flipped })
      burstAt(refs.current[i], 8)
    } else {
      patch(i, { held: false })
    }
    drag.current = null
  }

  const key = (i: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      patch(i, { flipped: !items[i].flipped })
    }
  }

  return (
    <section className={styles.sec} id="moments">
      <Reveal as="h2" className={styles.h2}>Our <em>moments</em></Reveal>

      <Reveal>
        <div ref={tableRef} className={styles.table} style={{ height, ['--pw' as string]: `${pw}px` }}>
          {photos.map((photo, i) => {
            const it = items[i]
            if (!it) return null
            return (
              <div
                key={i}
                ref={(el) => { refs.current[i] = el }}
                className={`${styles.polaroid} ${it.held ? styles.held : ''} ${it.flipped ? styles.flipped : ''}`}
                style={{ transform: `translate(${it.x}px, ${it.y}px) rotate(${it.r}deg)${it.held ? ' scale(1.06)' : ''}`, zIndex: it.z }}
                tabIndex={0}
                role="button"
                aria-label={`Photo: ${photo.caption}. Press Enter to flip.`}
                onPointerDown={(e) => down(i, e)}
                onPointerMove={(e) => move(i, e)}
                onPointerUp={() => up(i)}
                onPointerCancel={() => up(i)}
                onKeyDown={(e) => key(i, e)}
              >
                <div className={styles.polInner}>
                  <div className={`${styles.polFace} ${styles.polNote}`}>
                    <span className={styles.tape} aria-hidden="true" />
                    <svg className={styles.noteHeart} viewBox="0 0 100 90" aria-hidden="true"><path fill="currentColor" d="M50 85 C20 62 2 44 2 26 C2 12 13 3 26 3 C37 3 46 9 50 18 C54 9 63 3 74 3 C87 3 98 12 98 26 C98 44 80 62 50 85 Z" /></svg>
                    <p>{photo.caption}</p>
                    {photo.date && <small>{photo.date}</small>}
                    <span className={styles.noteHint} aria-hidden="true">tap to see</span>
                  </div>
                  <div className={`${styles.polFace} ${styles.polBack}`}>
                    <div className={styles.polArt} style={{ background: `linear-gradient(135deg, hsl(${(i * 47 + 330) % 360} 70% 55%), hsl(${(i * 47 + 20) % 360} 75% 35%))` }}>
                      {photo.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.url} alt={photo.caption} loading="lazy" draggable={false} />
                      ) : (
                        <svg viewBox="0 0 100 90" aria-hidden="true"><path fill="#fff" d="M50 85 C20 62 2 44 2 26 C2 12 13 3 26 3 C37 3 46 9 50 18 C54 9 63 3 74 3 C87 3 98 12 98 26 C98 44 80 62 50 85 Z" /></svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className={styles.tools}>
          <button className={styles.chip} type="button" onClick={layout}>Shuffle our memories</button>
        </div>
      </Reveal>
    </section>
  )
}
