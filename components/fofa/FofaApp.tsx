'use client'
import { useEffect, useState } from 'react'
import styles from './fofa.module.css'
import Background from './Background'
import Lock from './Lock'
import Opening from './Opening'
import Splash from './Splash'
import Story from './Story'
import type { ResolvedCouple } from './Story'

const STORAGE_KEY = 'fofa-unlocked'

/**
 * NOTE: this site is a static export, so the PIN is checked in the browser.
 * It keeps casual visitors out, but it is not real security: anyone who reads the
 * page's JavaScript can find the PIN and the content.
 */
export default function FofaApp({ pin, lockPhoto, couple }: { pin: string; lockPhoto: string | null; couple: ResolvedCouple }) {
  const [state, setState] = useState<'loading' | 'locked' | 'open'>('loading')
  const [revealing, setRevealing] = useState(false)
  const [covered, setCovered] = useState(false)
  const [preload, setPreload] = useState(false)

  useEffect(() => {
    let unlocked = false
    try { unlocked = sessionStorage.getItem(STORAGE_KEY) === '1' } catch { /* storage blocked: stay locked */ }
    setState(unlocked ? 'open' : 'locked')
  }, [])

  const unlock = () => {
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    window.scrollTo(0, 0)
    setRevealing(true)
    setCovered(false)
    setState('open')
  }

  const lockAgain = () => {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    window.scrollTo(0, 0)
    setPreload(false)
    setState('locked')
  }

  return (
    <div className={styles.page}>
      <Splash />
      <Background />
      <div className={styles.layer}>
        {state === 'locked' && <Lock pin={pin} photo={lockPhoto} initials={[couple.him[0], couple.her[0]]} onCorrect={() => setPreload(true)} onUnlocked={unlock} />}
        {(state === 'open' || (state === 'locked' && preload)) && (
          // Built while the lock says "Welcome home" but kept invisible, so mounting it can't stutter the opening.
          <div key="story" className={state === 'locked' || (revealing && !covered) ? styles.storyHold : undefined}>
            <Story couple={couple} onLock={lockAgain} />
          </div>
        )}
        {revealing && <Opening initials={[couple.him[0], couple.her[0]]} onCovered={() => setCovered(true)} onDone={() => setRevealing(false)} />}
      </div>
    </div>
  )
}
