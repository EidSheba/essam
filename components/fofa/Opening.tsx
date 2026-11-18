'use client'
import { useEffect } from 'react'
import styles from './fofa.module.css'
import { burstHearts } from './hearts'
import { usePrefersReducedMotion } from './hooks'

const HEART = 'M50 85 C20 62 2 44 2 26 C2 12 13 3 26 3 C37 3 46 9 50 18 C54 9 63 3 74 3 C87 3 98 12 98 26 C98 44 80 62 50 85 Z'

/**
 * The reveal after the right PIN: a memory book rises in the dark, its cover swings open,
 * and we fall into the page, which turns into the story.
 */
export default function Opening({ initials, onCovered, onDone }: { initials: [string, string]; onCovered: () => void; onDone: () => void }) {
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    if (reduce) { onCovered(); onDone(); return }
    // The story is already built (hidden); it is shown just after the dark overlay is opaque, long before the book finishes.
    const t1 = window.setTimeout(onCovered, 380)
    const t2 = window.setTimeout(() => burstHearts(window.innerWidth / 2, window.innerHeight / 2, 28), 2250)
    const t3 = window.setTimeout(onDone, 2700)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  if (reduce) return null

  return (
    <div className={styles.opening} aria-hidden="true">
      <div className={styles.scene}>
        <div className={styles.bookShift}>
          <div className={styles.bookZoom}>
            <div className={styles.bookIn}>
              <div className={styles.book}>
                <div className={styles.bookShadow} />
                <div className={styles.pageBlock}>
                  <div className={styles.pageInk}>
                    <svg viewBox="0 0 100 90"><path d={HEART} fill="rgba(240, 30, 90, .75)" /></svg>
                  </div>
                </div>
                <div className={styles.cover}>
                  <div className={styles.coverFront}>
                    <div className={styles.coverFrame}>
                      <svg className={styles.coverHeart} viewBox="0 0 100 90"><path d={HEART} fill="none" stroke="#f5d78e" strokeWidth="3" /></svg>
                      <span className={styles.coverLetters}>{initials[0]} <i>&amp;</i> {initials[1]}</span>
                      <span className={styles.coverTitle}>our story</span>
                    </div>
                  </div>
                  <div className={styles.coverBack} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
