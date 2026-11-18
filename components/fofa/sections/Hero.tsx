'use client'
import { useEffect, useState } from 'react'
import styles from '../fofa.module.css'

const UNITS = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'] as const
type Parts = Record<(typeof UNITS)[number], number>

/** Calendar-accurate time elapsed since `from`. */
function elapsed(from: Date, now: Date): Parts {
  let cursor = new Date(from)
  let years = 0
  let months = 0
  for (;;) {
    const next = new Date(cursor)
    next.setFullYear(next.getFullYear() + 1)
    if (next > now) break
    cursor = next
    years++
  }
  for (;;) {
    const next = new Date(cursor)
    next.setMonth(next.getMonth() + 1)
    if (next > now) break
    cursor = next
    months++
  }
  let ms = now.getTime() - cursor.getTime()
  const days = Math.floor(ms / 864e5); ms -= days * 864e5
  const hours = Math.floor(ms / 36e5); ms -= hours * 36e5
  const minutes = Math.floor(ms / 6e4); ms -= minutes * 6e4
  const seconds = Math.floor(ms / 1000)
  return { years, months, days, hours, minutes, seconds }
}

export default function Hero({ him, her, tagline, since }: { him: string; her: string; tagline: string; since: string }) {
  const [parts, setParts] = useState<Parts | null>(null)

  useEffect(() => {
    const from = new Date(since)
    const tick = () => setParts(elapsed(from, new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [since])

  const sinceLabel = new Date(since).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className={styles.hero} id="top">
      <h1 className={styles.names} aria-label={`${him} and ${her}`}>
        <span>{him}</span>
        <span className={styles.amp} aria-hidden="true">&amp;</span>
        <span>{her}</span>
      </h1>
      <p className={styles.tagline}>{tagline}</p>

      <div className={styles.clock} role="timer" aria-label="Time together">
        {UNITS.map((u) => (
          <div key={u} className={styles.unit}>
            <b>{parts ? parts[u] : 0}</b>
            <small>{u}</small>
          </div>
        ))}
      </div>
      <p className={styles.since}>together since {sinceLabel} &middot; and counting every second</p>
    </header>
  )
}
