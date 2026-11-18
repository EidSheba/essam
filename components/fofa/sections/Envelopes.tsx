'use client'
import { useRef, useState } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'
import type { Envelope } from '../../../data/fofa'

export default function Envelopes({ envelopes }: { envelopes: Envelope[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const toggle = (i: number) => {
    const opening = !open.has(i)
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
    if (opening) burstAt(refs.current[i], 14)
  }

  return (
    <section className={styles.sec} id="letters">
      <Reveal as="h2" className={styles.h2}>Open <em>when&hellip;</em></Reveal>
      <div className={styles.envs}>
        {envelopes.map((env, i) => (
          <Reveal key={env.when}>
            <button
              ref={(el) => { refs.current[i] = el }}
              className={`${styles.env} ${open.has(i) ? styles.open : ''}`}
              style={{ width: '100%' }}
              type="button"
              aria-expanded={open.has(i)}
              aria-label={`Open when ${env.when}`}
              onClick={() => toggle(i)}
            >
              <span className={styles.envInner}>
                <span className={`${styles.envFace} ${styles.envFront}`}>
                  <span className={styles.seal} aria-hidden="true">&hearts;</span>
                  <em>open when</em>
                  <span className={styles.when}>{env.when}</span>
                </span>
                <span className={`${styles.envFace} ${styles.envBack}`}><p>{env.text}</p></span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
