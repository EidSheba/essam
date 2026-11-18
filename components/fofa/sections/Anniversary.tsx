'use client'
import { useEffect, useState } from 'react'
import styles from '../fofa.module.css'
import { Reveal, useInView, usePrefersReducedMotion } from '../hooks'
import { burstHearts } from '../hearts'

const CIRCUMFERENCE = 326.73 // 2 * PI * r (r = 52)

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function Anniversary({ anniversary }: { anniversary: string }) {
  const reduce = usePrefersReducedMotion()
  const [ringRef, seen] = useInView<HTMLDivElement>(0.5)
  const [info, setInfo] = useState<{ days: number; nth: number; label: string } | null>(null)
  const [shownDays, setShownDays] = useState(0)

  useEffect(() => {
    const [y, m, d] = anniversary.split('-').map(Number)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let next = new Date(today.getFullYear(), m - 1, d)
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d)
    setInfo({
      days: Math.round((next.getTime() - today.getTime()) / 864e5),
      nth: next.getFullYear() - y,
      label: next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
    })
  }, [anniversary])

  // Count the number up once the ring is on screen.
  useEffect(() => {
    if (!seen || !info) return
    if (info.days === 0) window.setTimeout(() => burstHearts(window.innerWidth / 2, window.innerHeight / 2, 60), 800)
    if (reduce) { setShownDays(info.days); return }
    const start = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 2200)
      setShownDays(Math.round(info.days * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [seen, info, reduce])

  const days = info?.days ?? 0
  const offset = seen && info ? CIRCUMFERENCE * (days / 365) : CIRCUMFERENCE

  return (
    <section className={styles.sec} id="forever">
      <Reveal as="h2" className={styles.h2}>Until our next <em>anniversary</em></Reveal>
      <Reveal className={styles.ringWrap}>
        <div style={{ marginTop: 44 }}>
          <div ref={ringRef} className={styles.ring}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs><linearGradient id="fofaRg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f5d6a0" /><stop offset="1" stopColor="#ff4d7d" /></linearGradient></defs>
              <circle className={styles.track} cx="60" cy="60" r="52" />
              <circle className={styles.prog} cx="60" cy="60" r="52" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
            </svg>
            <div className={styles.ringNum}>
              <b>{shownDays}</b>
              <small>{info?.days === 0 ? 'today' : info?.days === 1 ? 'day to go' : 'days to go'}</small>
            </div>
          </div>
          <p className={styles.lead} style={{ margin: '0 auto' }}>
            {info ? (info.days === 0 ? `Happy ${ordinal(info.nth)} anniversary, my love!` : `until our ${ordinal(info.nth)} anniversary, on ${info.label}.`) : ' '}
          </p>
        </div>
      </Reveal>
    </section>
  )
}
