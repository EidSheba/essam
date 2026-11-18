'use client'
import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import styles from './fofa.module.css'
import { burstHearts } from './hearts'

const WRONG_LINES = ['Not quite, my love.', 'Close your eyes and think harder.', 'That is not the key to my heart.', 'Try the numbers only we know.']
const MAX_TRIES = 5
const LOCKOUT_MS = 30_000

type Phase = 'idle' | 'checking' | 'wrong' | 'open'

const HEART = 'M50 85 C20 62 2 44 2 26 C2 12 13 3 26 3 C37 3 46 9 50 18 C54 9 63 3 74 3 C87 3 98 12 98 26 C98 44 80 62 50 85 Z'

export default function Lock({ pin, photo, initials, onCorrect, onUnlocked }: { pin: string; photo: string | null; initials: [string, string]; onCorrect: () => void; onUnlocked: () => void }) {
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const busy = useRef(false)
  const wrongCount = useRef(0)
  const lockedUntil = useRef(0)

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const reset = () => {
    setDigits(['', '', '', ''])
    inputs.current[0]?.focus()
  }

  const submit = (value: string) => {
    if (busy.current) return
    if (Date.now() < lockedUntil.current) {
      setMessage('Too many tries. Breathe, and come back in a moment.')
      setPhase('wrong')
      window.setTimeout(() => { setPhase('idle'); reset() }, 600)
      return
    }
    busy.current = true
    setPhase('checking')
    setMessage('Turning the key…')

    // A short pause so the heart reacts before the answer.
    window.setTimeout(() => {
      if (value === pin) {
        setMessage('Welcome home.')
        onCorrect()
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 40)
        setPhase('open')
        window.setTimeout(onUnlocked, 800)
        return
      }
      wrongCount.current += 1
      if (wrongCount.current >= MAX_TRIES) {
        lockedUntil.current = Date.now() + LOCKOUT_MS
        wrongCount.current = 0
        setMessage('Too many tries. Breathe, and come back in a moment.')
      } else {
        setMessage(WRONG_LINES[(wrongCount.current - 1) % WRONG_LINES.length])
      }
      setPhase('wrong')
      window.setTimeout(() => { setPhase('idle'); reset(); busy.current = false }, 650)
    }, 350)
  }

  const setDigit = (index: number, raw: string) => {
    const d = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = d
    setDigits(next)
    if (d && index < 3) inputs.current[index + 1]?.focus()
    if (next.every(Boolean)) submit(next.join(''))
  }

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 3) inputs.current[index + 1]?.focus()
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!pasted) return
    e.preventDefault()
    const next = ['', '', '', '']
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputs.current[Math.min(pasted.length, 3)]?.focus()
    if (pasted.length === 4) submit(pasted)
  }

  const cls = [styles.lock, phase === 'checking' && styles.checking, phase === 'wrong' && styles.wrong, phase === 'open' && styles.open]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <main className={cls}>
        <div className={styles.initials} aria-hidden="true">{initials[0]}<i>&hearts;</i>{initials[1]}</div>

        {/* Our photo inside the heart. */}
        <div className={`${styles.heartLock} ${styles.photoHeart}`} role="img" aria-label="A locked heart with our photo">
          <svg className={styles.clipDef} width="0" height="0" aria-hidden="true">
            <defs>
              <clipPath id="fofaHeartBB" clipPathUnits="objectBoundingBox"><path transform="scale(0.01 0.011111)" d={HEART} /></clipPath>
            </defs>
          </svg>
          <div className={styles.photoClip}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" draggable={false} />
            ) : (
              <span className={styles.photoBlank} />
            )}
          </div>
          <svg className={styles.photoRing} viewBox="0 0 100 90" aria-hidden="true">
            <defs>
              <linearGradient id="fofaHg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff7a3d" /><stop offset="1" stopColor="#f01e5a" /></linearGradient>
            </defs>
            <path className={styles.outline} d={HEART} />
            <path className={styles.crack} d="M50 6 L46 24 L55 36 L47 52 L54 66 L50 84" />
          </svg>
        </div>

        <h1 className={styles.srOnly}>Just for two</h1>
        <p className={styles.lockSub}>Only you know the way in</p>

        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className={styles.dials} role="group" aria-label="Secret number">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el }}
                className={`${styles.dial} ${d ? styles.filled : ''}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                aria-label={`Digit ${i + 1}`}
                autoComplete="off"
                disabled={phase === 'open'}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={onPaste}
              />
            ))}
          </div>
        </form>
        <p className={styles.lockMsg} aria-live="polite">{message}</p>
      </main>
    </>
  )
}
