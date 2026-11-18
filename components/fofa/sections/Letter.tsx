'use client'
import { Fragment, useEffect, useState } from 'react'
import styles from '../fofa.module.css'
import { Reveal, typeText, useInView, usePrefersReducedMotion } from '../hooks'

/** The love letter types itself out, line by line, when it scrolls into view. */
export default function Letter({ lines, signature }: { lines: string[]; signature: string }) {
  const reduce = usePrefersReducedMotion()
  const [ref, seen] = useInView<HTMLDivElement>(0.25)
  const all = [...lines, signature]
  const [typed, setTyped] = useState<string[]>(() => all.map(() => ''))
  const [active, setActive] = useState(-1)

  useEffect(() => {
    if (!seen) return
    let cancelled = false
    let cancel = () => {}
    let pause: ReturnType<typeof setTimeout>
    const run = (i: number) => {
      if (cancelled || i >= all.length) { setActive(-1); return }
      setActive(i)
      cancel = typeText(
        all[i],
        (s) => setTyped((prev) => prev.map((v, k) => (k === i ? s : v))),
        () => { pause = setTimeout(() => run(i + 1), 350) },
        reduce,
      )
    }
    run(0)
    return () => { cancelled = true; cancel(); clearTimeout(pause) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, reduce])

  return (
    <section className={styles.sec} id="letter">
      <Reveal as="p" className={styles.kicker}>the last page</Reveal>
      <Reveal as="h2" className={styles.h2}>A <em>letter</em> for you</Reveal>
      <Reveal>
        <div ref={ref} className={styles.paper}>
          {all.map((full, i) => (
            <Fragment key={i}>
              <p className={styles.srOnly}>{full}</p>
              <p
                aria-hidden="true"
                className={`${i === all.length - 1 ? styles.sign : ''} ${active === i ? styles.caret : ''}`}
              >
                {typed[i]}
              </p>
            </Fragment>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
