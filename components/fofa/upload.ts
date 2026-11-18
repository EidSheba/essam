/** Downscale a picked image so it stays small enough to keep in localStorage. */
export function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 1100 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

export async function filesToDataUrls(files: FileList | null): Promise<string[]> {
  const out: string[] = []
  for (const f of Array.from(files ?? [])) {
    if (!f.type.startsWith('image/')) continue
    try { out.push(await toDataUrl(f)) } catch { /* skip unreadable file */ }
  }
  return out
}
