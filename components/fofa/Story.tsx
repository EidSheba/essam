'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './fofa.module.css'
import { burstHearts } from './hearts'
import Hero from './sections/Hero'
import Moments from './sections/Moments'
import type { ResolvedPhoto } from './sections/Moments'
import Darkroom from './sections/Darkroom'
import Songs from './sections/Songs'
import Reasons from './sections/Reasons'
import type { CoupleData } from '../../data/fofa'

export interface ResolvedCouple extends Omit<CoupleData, 'pin' | 'lockPhoto' | 'photos' | 'together'> {
  photos: ResolvedPhoto[]
  together: ResolvedPhoto[]
}

export default function Story({ couple, onLock }: { couple: ResolvedCouple; onLock: () => void }) {
  const [toast, setToast] = useState(false)
  const typed = useRef('')

  // Little surprises: hearts where you click, and a hidden message if you type "iloveyou".
  useEffect(() => {
    let hide: ReturnType<typeof setTimeout>
    const timers: ReturnType<typeof setTimeout>[] = []

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('button, a, input, iframe, dialog, [role="button"]')) return
      burstHearts(e.clientX, e.clientY, 10)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return
      typed.current = (typed.current + e.key.toLowerCase()).slice(-9)
      if (typed.current.endsWith('iloveyou')) {
        setToast(true)
        clearTimeout(hide)
        hide = setTimeout(() => setToast(false), 3200)
        for (let i = 0; i < 6; i++) {
          timers.push(setTimeout(() => burstHearts(80 + Math.random() * (window.innerWidth - 160), 80 + Math.random() * (window.innerHeight - 160), 26), i * 220))
        }
      }
    }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
      clearTimeout(hide)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className={styles.entry}>
      <Hero him={couple.him} her={couple.her} tagline={couple.tagline} since={couple.since} />
      <Moments photos={couple.photos} />
      <Darkroom photos={couple.together} initial={`${couple.him[0]} ♥ ${couple.her[0]}`} />
      <Songs songs={couple.songs} />
      <Reasons reasons={couple.reasons} />

      <footer className={styles.footer}>
        <button className={styles.chip} type="button" onClick={onLock}>Lock our little world</button>
      </footer>

      <div className={`${styles.toast} ${toast ? styles.show : ''}`} role="status">{toast ? 'I love you more ♥' : ''}</div>
    </div>
  )
}
