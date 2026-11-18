'use client'
import { useEffect, useState } from 'react'
import styles from './fofa.module.css'

const LOGO = '/couples/fofa/evermore_emblem_deeper.png'
const MIN_MS = 2200

/** Full-screen loading page: the Evermore emblem eases in while the site finishes loading, then fades away. */
export default function Splash() {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const started = Date.now()
    let timer: ReturnType<typeof setTimeout>
    const finish = () => {
      timer = setTimeout(() => {
        setLeaving(true)
        timer = setTimeout(() => setGone(true), 900)
      }, Math.max(0, MIN_MS - (Date.now() - started)))
    }
    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    return () => { clearTimeout(timer); window.removeEventListener('load', finish) }
  }, [])

  if (gone) return null
  return (
    <div className={`${styles.splash} ${leaving ? styles.splashOut : ''}`} role="status" aria-label="Loading">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.splashLogo} src={LOGO} alt="Evermore" draggable={false} />
      <span className={styles.splashBar} aria-hidden="true" />
    </div>
  )
}
