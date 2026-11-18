'use client'
import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'

const PAPER = ['#fff4dc', '#ffeacb', '#fffaf0', '#fff0d6']
const RIBBON = ['#f01e5a', '#0e9f84', '#ff7a3d', '#c24bd6', '#f29b1d']
const CLOSING = 'And a thousand more I have not found the words for yet.'

/** One bottle holding one rolled note per reason: every tap draws a note out, so the bottle slowly empties. */
export default function Reasons({ reasons }: { reasons: string[] }) {
  const n = reasons.length
  const order = useMemo(() => reasons.map((_, i) => i).sort(() => Math.random() - 0.5), [reasons])
  // 0 = sealed and full, 1..n = reasons, n + 1 = the closing note (bottle empty), then it fills up again.
  const [count, setCount] = useState(0)
  const bottle = useRef<HTMLButtonElement>(null)

  const step = count % (n + 2)
  const left = step === 0 ? n : Math.max(n - step, 0)
  const line = step === 0 ? '' : step === n + 1 ? CLOSING : reasons[order[step - 1]]

  const rolls = useMemo(() => {
    const cols = Math.min(5, n)
    return Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / cols)
      const col = i % cols
      const jitter = ((i * 29) % 11) - 5
      return {
        x: 24 + (col + 0.5) * (72 / cols) + jitter * 0.6,
        y: 184 - row * 24 + ((i * 17) % 7) - 3,
        rot: ((i * 47) % 64) - 32,
        paper: PAPER[i % PAPER.length],
        ribbon: RIBBON[i % RIBBON.length],
      }
    })
  }, [n])

  const draw = () => {
    if (step !== n + 1) burstAt(bottle.current, 8)
    setCount((c) => c + 1)
  }

  const opening = step > 0 && step <= n + 1

  return (
    <section className={styles.sec} id="reasons">
      <Reveal as="h2" className={styles.h2}>It Was Always <em>You</em></Reveal>

      <Reveal className={styles.jar}>
        <div className={styles.noteSlot} aria-live="polite">
          {opening && (
            <div key={count} className={styles.note}>
              <p>{line}</p>
            </div>
          )}
        </div>

        <button ref={bottle} className={styles.bottle} type="button" aria-label="Take a note out of the bottle" onClick={draw}>
          <span className={`${styles.bottleShake} ${opening ? (count % 2 ? styles.shakeA : styles.shakeB) : ''}`}>
            <svg viewBox="0 0 120 230" aria-hidden="true">
              <defs>
                <linearGradient id="fofaGlass" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#bfeee8" stopOpacity=".95" />
                  <stop offset=".45" stopColor="#e9fbf8" stopOpacity=".75" />
                  <stop offset="1" stopColor="#8fd8cf" stopOpacity=".95" />
                </linearGradient>
                <radialGradient id="fofaPuff"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset="1" stopColor="#ffd9e2" stopOpacity="0" /></radialGradient>
              </defs>
              <path d="M46 28 h28 v34 C74 80 108 88 108 128 V196 a24 24 0 0 1 -24 24 H36 a24 24 0 0 1 -24 -24 V128 C12 88 46 80 46 62 Z" fill="url(#fofaGlass)" stroke="rgba(14,124,102,.55)" strokeWidth="2.5" />
              {rolls.map((r, i) => (
                <g key={i} className={`${styles.roll} ${i >= left ? styles.rollGone : ''}`} style={{ ['--dly' as string]: `${(i % 5) * 0.05}s` } as CSSProperties}>
                  <g transform={`translate(${r.x} ${r.y}) rotate(${r.rot})`}>
                    <rect x="-7" y="-23" width="14" height="46" rx="6" fill={r.paper} stroke="#d9b98a" strokeWidth="1.4" />
                    <rect x="-8" y="-4" width="16" height="6" rx="2.5" fill={r.ribbon} />
                  </g>
                </g>
              ))}
              {opening && <circle key={`p${count}`} className={styles.puff} cx="60" cy="26" r="26" fill="url(#fofaPuff)" />}
              <g key={`c${count}`} className={`${styles.cork} ${opening && step <= n ? styles.corkPop : ''}`}>
                <rect x="46" y="4" width="28" height="26" rx="6" fill="#c08a52" />
                <path d="M50 12h20M50 20h20" stroke="#9c6a38" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>
          </span>
        </button>
        <p className={`${styles.seaHint} ${step === 0 ? styles.seaHintOn : ''}`}>Tap the bottle.</p>
      </Reveal>
    </section>
  )
}
