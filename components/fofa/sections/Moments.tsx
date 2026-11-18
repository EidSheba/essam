'use client'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'

export interface ResolvedPhoto { url: string | null; caption: string; date?: string; video?: boolean; id?: number }

export default function Moments({ photos }: { photos: ResolvedPhoto[] }) {
  const tableRef = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [W, setW] = useState(800)

  const total = photos.length

  const cols = W < 640 ? 2 : 3
  const pw = W < 640 ? Math.min(168, W / cols - 16) : 224
  const ph = pw * 1.22
  const height = Math.ceil(total / cols) * (ph + 30) + 30
  const pos = (i: number) => ({ x: ((i % cols) + 0.5) * (W / cols) - pw / 2, y: 10 + Math.floor(i / cols) * (ph + 30) })

  useEffect(() => {
    const measure = () => setW(tableRef.current?.clientWidth ?? 800)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const toggle = (i: number) => {
    setFlipped((f) => ({ ...f, [i]: !f[i] }))
    burstAt(refs.current[i], 8)
  }

  const key = (i: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(i)
    }
  }

  return (
    <section className={styles.sec} id="moments">
      <Reveal as="h2" className={styles.h2}>Our <em>moments</em></Reveal>

      <Reveal>
        <div ref={tableRef} className={styles.table} style={{ height, ['--pw' as string]: `${pw}px` }}>
          {photos.map((photo, i) => {
            const { x, y } = pos(i)
            return (
              <div
                key={i}
                ref={(el) => { refs.current[i] = el }}
                className={`${styles.polaroid} ${flipped[i] ? styles.flipped : ''}`}
                style={{ transform: `translate(${x}px, ${y}px)`, zIndex: i + 1 }}
                tabIndex={0}
                role="button"
                aria-label={`Photo: ${photo.caption}. Press Enter to flip.`}
                onClick={() => toggle(i)}
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
      </Reveal>
    </section>
  )
}
