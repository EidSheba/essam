'use client'
import { createElement, useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import styles from './fofa.module.css'

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

/** True once the element has scrolled into view (and stays true). */
export function useInView<T extends Element>(threshold = 0.18): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

type RevealTag = 'div' | 'p' | 'h2' | 'section'

/** Fades and lifts its children in when scrolled into view. */
export function Reveal({
  as = 'div',
  className = '',
  children,
}: {
  as?: RevealTag
  className?: string
  children: ReactNode
}) {
  const [ref, seen] = useInView<HTMLElement>()
  return createElement(
    as,
    { ref, className: `${styles.reveal} ${seen ? styles.on : ''} ${className}` },
    children,
  )
}

/**
 * Types `text` out one character at a time. Returns a cancel function.
 * With reduced motion it shows the whole text at once.
 */
export function typeText(
  text: string,
  onUpdate: (shown: string) => void,
  onDone?: () => void,
  reduce = false,
): () => void {
  if (reduce) {
    onUpdate(text)
    onDone?.()
    return () => {}
  }
  let i = 0
  let timer: ReturnType<typeof setTimeout>
  const step = () => {
    i += 1
    onUpdate(text.slice(0, i))
    if (i < text.length) timer = setTimeout(step, 22 + Math.random() * 28)
    else onDone?.()
  }
  timer = setTimeout(step, 22)
  return () => clearTimeout(timer)
}
