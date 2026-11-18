/**
 * Photos and videos added by the visitor are kept in this browser's IndexedDB
 * (it handles big files, unlike localStorage). They are only visible on the device that added them.
 */
export interface StoredMedia { id?: number; kind: 'image' | 'video'; blob: Blob }

const DB = 'fofa-media'
const STORE = 'items'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true }) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function loadMedia(): Promise<StoredMedia[]> {
  try {
    const db = await open()
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll()
      req.onsuccess = () => resolve(req.result as StoredMedia[])
      req.onerror = () => reject(req.error)
    })
  } catch { return [] }
}

async function saveMedia(item: StoredMedia): Promise<void> {
  try {
    const db = await open()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).add(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch { /* storage blocked or full: the item still shows until the page closes */ }
}

/** Downscale a picked image so it stays small. */
function shrinkImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

/** Turns picked files (photos or videos) into stored media and saves them. */
export async function addMedia(files: FileList | null): Promise<StoredMedia[]> {
  const out: StoredMedia[] = []
  for (const f of Array.from(files ?? [])) {
    try {
      if (f.type.startsWith('video/')) out.push({ kind: 'video', blob: f })
      else if (f.type.startsWith('image/')) out.push({ kind: 'image', blob: await shrinkImage(f) })
    } catch { /* skip unreadable file */ }
  }
  for (const m of out) await saveMedia(m)
  return out
}
