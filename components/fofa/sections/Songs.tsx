'use client'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import styles from '../fofa.module.css'
import { Reveal } from '../hooks'
import { burstAt } from '../hearts'
import type { Song } from '../../../data/fofa'

interface Meta { cover: string | null; preview: string | null }

interface SpotifyController {
  addListener: (event: string, cb: (e: { data: { isPaused: boolean; position: number; duration: number } }) => void) => void
  play: () => void
  seek: (seconds: number) => void
  destroy: () => void
}
interface SpotifyApi {
  createController: (el: HTMLElement, opts: { uri: string; width: string; height: number }, cb: (c: SpotifyController) => void) => void
}

let spotifyApi: Promise<SpotifyApi> | null = null

/** Loads Spotify's iFrame API once. */
function loadSpotify(): Promise<SpotifyApi> {
  if (!spotifyApi) {
    spotifyApi = new Promise((resolve) => {
      const w = window as unknown as { onSpotifyIframeApiReady?: (api: SpotifyApi) => void }
      w.onSpotifyIframeApiReady = resolve
      const script = document.createElement('script')
      script.src = 'https://open.spotify.com/embed/iframe-api/v1'
      script.async = true
      document.body.appendChild(script)
    })
  }
  return spotifyApi
}

let jsonpId = 0

/** iTunes Search over JSONP: its CORS headers are not reliable from a browser, a script tag always works. */
function itunes(term: string): Promise<{ artworkUrl100?: string; previewUrl?: string } | undefined> {
  return new Promise((resolve) => {
    const cb = `__fofaItunes${jsonpId++}`
    const w = window as unknown as Record<string, unknown>
    const script = document.createElement('script')
    const finish = (hit?: { artworkUrl100?: string; previewUrl?: string }) => {
      window.clearTimeout(timer)
      delete w[cb]
      script.remove()
      resolve(hit)
    }
    const timer = window.setTimeout(() => finish(), 8000)
    w[cb] = (data: { results?: { artworkUrl100?: string; previewUrl?: string }[] }) => finish(data?.results?.[0])
    script.onerror = () => finish()
    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=1&callback=${cb}`
    document.head.appendChild(script)
  })
}

/** Cover art and a 30s preview from the free iTunes Search API (no key needed). */
async function lookup(song: Song): Promise<Meta> {
  const hit = song.spotify || (song.cover && song.audio) ? undefined : await itunes(`${song.title} ${song.artist}`)
  return {
    cover: song.cover ?? (hit?.artworkUrl100 ? hit.artworkUrl100.replace('100x100', '600x600') : null),
    preview: song.audio ?? hit?.previewUrl ?? null,
  }
}

export default function Songs({ songs }: { songs: Song[] }) {
  const [meta, setMeta] = useState<Meta[]>(() => songs.map((s) => ({ cover: s.cover ?? null, preview: s.audio ?? null })))
  const [playing, setPlaying] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [spot, setSpot] = useState<number | null>(null)
  const [spotReady, setSpotReady] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const discs = useRef<(HTMLButtonElement | null)[]>([])
  const embeds = useRef<(HTMLDivElement | null)[]>([])
  const section = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    Promise.all(songs.map(lookup)).then((m) => { if (alive) setMeta(m) })
    return () => { alive = false }
  }, [songs])

  useEffect(() => () => { audio.current?.pause() }, [])

  // Only Spotify's small API script is fetched ahead of time (when the section is close), never the heavy player itself.
  useEffect(() => {
    const el = section.current
    if (!el || !songs.some((s) => s.spotify)) return
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { loadSpotify(); io.disconnect() } }, { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [songs])

  // The Spotify player is created only for the song you opened, and removed when you close it or open another.
  useEffect(() => {
    setSpotReady(false)
    if (spot === null) return
    const song = songs[spot]
    const host = embeds.current[spot]
    if (!song.spotify || !host) return
    let controller: SpotifyController | null = null
    let dead = false
    loadSpotify().then((api) => {
      if (dead) return
      host.replaceChildren()
      const mount = document.createElement('div')
      host.appendChild(mount)
      api.createController(mount, { uri: `spotify:track:${song.spotify}`, width: '100%', height: 152 }, (c) => {
        if (dead) { c.destroy(); return }
        controller = c
        let seeked = false
        c.addListener('playback_update', (e) => {
          const { isPaused, position, duration } = e.data
          const start = (song.startAt ?? 0) * 1000
          // only jump when it is the full track (a 30s preview can't reach the start point)
          if (!seeked && !isPaused && start && duration > start + 5000 && position < start - 1000) { seeked = true; c.seek(start / 1000) }
        })
        c.addListener('ready', () => { if (!dead) setSpotReady(true); c.play() })
      })
    })
    return () => { dead = true; controller?.destroy(); host.replaceChildren() }
  }, [spot, songs])

  const toggle = (i: number) => {
    burstAt(discs.current[i], 6)
    if (songs[i].spotify) {
      audio.current?.pause()
      setPlaying(null)
      setSpot((cur) => (cur === i ? null : i))
      return
    }
    setSpot(null)
    const src = meta[i].preview
    if (!audio.current) {
      const a = new Audio()
      a.addEventListener('timeupdate', () => setProgress(a.duration ? a.currentTime / a.duration : 0))
      a.addEventListener('ended', () => { setPlaying(null); setProgress(0) })
      audio.current = a
    }
    const a = audio.current
    if (playing === i) { a.pause(); setPlaying(null); return }
    if (!src) { setPlaying(null); a.pause(); return }
    a.src = src
    setProgress(0)
    a.play().then(() => setPlaying(i)).catch(() => setPlaying(null))
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audio.current
    if (!a || !a.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration
  }

  return (
    <section className={styles.sec} id="songs" ref={section}>
      <Reveal as="h2" className={styles.h2}>Our <em>soundtrack</em></Reveal>

      <Reveal className={styles.shelf}>
        {songs.map((song, i) => (
          <div className={styles.song} key={song.spotify ?? `${song.title}-${i}`}>
            <button
              ref={(el) => { discs.current[i] = el }}
              className={styles.disc}
              style={{ ['--h' as string]: song.hue } as CSSProperties}
              type="button"
              aria-label={`${playing === i || spot === i ? 'Pause' : 'Play'} ${song.title || 'song'}`}
              onClick={() => toggle(i)}
            >
              <span className={`${styles.discLabel} ${meta[i].cover ? styles.full : ''}`}>
                {meta[i].cover ? <img src={meta[i].cover!} alt="" draggable={false} /> : <>&hearts;</>}
              </span>
            </button>
            {song.title && <h3>{song.title}</h3>}
            {song.artist && <p className={styles.artist}>{song.artist}</p>}
            {song.line && <p className={styles.why}>{song.line}</p>}
            {song.spotify ? (
              <div className={`${styles.embed} ${spot === i ? styles.embedOn : ''} ${spot === i && !spotReady ? styles.embedLoading : ''}`} ref={(el) => { embeds.current[i] = el }} />
            ) : (
              <div className={styles.bar} onClick={seek}><i style={{ width: `${playing === i ? progress * 100 : 0}%` }} /></div>
            )}
            <button className={styles.chip} type="button" onClick={() => toggle(i)}>
              {spot === i && !spotReady ? 'Loading…' : playing === i || spot === i ? (song.spotify ? 'Close' : 'Pause') : 'Play here'}
            </button>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
