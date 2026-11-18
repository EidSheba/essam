'use client'
import { useEffect, useRef } from 'react'
import styles from './fofa.module.css'

interface Star { x: number; y: number; r: number; p: number; sp: number; z: number }
interface Heart { x: number; y: number; s: number; v: number; sway: number; a: number; c: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; d: number; s: number; c: string; g: number }

const COLORS = ['255,77,125', '255,179,198', '245,215,142', '255,255,255']
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Living background: twinkling stars, rising hearts, cursor trail and heart bursts. */
export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    let stars: Star[] = []
    let hearts: Heart[] = []
    const sparks: Spark[] = []
    let raf = 0

    const heartPath = (x: number, y: number, s: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y + s * 0.3)
      ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3)
      ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s)
      ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3)
      ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3)
      ctx.closePath()
    }

    const newHeart = (anywhere: boolean): Heart => ({
      x: rand(0, W), y: anywhere ? rand(0, H) : H + 30, s: rand(8, 26), v: rand(0.15, 0.5),
      sway: rand(0, 6.28), a: rand(0.18, 0.4), c: COLORS[(Math.random() * 3) | 0],
    })

    const resize = () => {
      // Mobile browsers fire resize while scrolling (address bar); don't respawn everything for that.
      const sameWidth = W === window.innerWidth
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (sameWidth && stars.length) return
      stars = Array.from({ length: Math.round((W * H) / 9000) }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(0.2, 1.4), p: rand(0, 6.28), sp: rand(0.5, 1.8), z: rand(0.2, 1),
      }))
      hearts = reduce ? [] : Array.from({ length: 14 }, () => newHeart(true))
    }

    const onBurst = (e: Event) => {
      const { x, y, n } = (e as CustomEvent<{ x: number; y: number; n: number }>).detail
      const count = reduce ? Math.min(n, 6) : n
      for (let i = 0; i < count; i++) {
        const ang = rand(0, 6.28)
        const sp = rand(1.5, 5.5)
        sparks.push({
          x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2, life: 1, d: rand(0.008, 0.018),
          s: rand(7, 20), c: COLORS[(Math.random() * COLORS.length) | 0], g: 0.06,
        })
      }
    }

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H)

      for (const s of stars) {
        const tw = reduce ? 0.7 : 0.45 + 0.55 * Math.sin((t / 1000) * s.sp + s.p)
        ctx.fillStyle = `rgba(255,255,255,${(tw * s.z * 0.9).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.28)
        ctx.fill()
      }

      hearts.forEach((o, i) => {
        o.y -= o.v
        o.sway += 0.01
        if (o.y < -40) hearts[i] = newHeart(false)
        ctx.fillStyle = `rgba(${o.c},${o.a})`
        heartPath(o.x + Math.sin(o.sway) * 22, o.y, o.s)
        ctx.fill()
      })

      for (let k = sparks.length - 1; k >= 0; k--) {
        const p = sparks[k]
        p.x += p.vx
        p.y += p.vy
        p.vy += p.g
        p.life -= p.d
        if (p.life <= 0) { sparks.splice(k, 1); continue }
        ctx.fillStyle = `rgba(${p.c},${(p.life * 0.9).toFixed(3)})`
        heartPath(p.x, p.y, p.s * (0.5 + p.life * 0.5))
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('fofa:burst', onBurst)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('fofa:burst', onBurst)
    }
  }, [])

  return <canvas ref={ref} className={styles.bg} aria-hidden="true" />
}
