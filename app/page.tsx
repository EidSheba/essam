import { existsSync } from 'node:fs'
import path from 'node:path'
import FofaApp from '../components/fofa/FofaApp'
import type { ResolvedCouple } from '../components/fofa/Story'
import { fofa } from '../data/fofa'
import type { Photo } from '../data/fofa'

/** Runs at build time: a photo whose file is missing becomes `url: null` and shows a gradient placeholder. */
function resolve(photos: Photo[]) {
  return photos.map((p) => ({
    url: existsSync(path.join(process.cwd(), 'public', p.src)) ? encodeURI(`/${p.src}`) : null,
    caption: p.caption,
    date: p.date,
  }))
}

export default function Page() {
  const { pin, lockPhoto, photos, together, ...rest } = fofa
  const couple: ResolvedCouple = {
    ...rest,
    photos: resolve(photos),
    // The deck skips photos whose file is missing, so deleting a picture never leaves an empty card.
    together: resolve(together).filter((p) => p.url),
  }
  const lockUrl = existsSync(path.join(process.cwd(), 'public', lockPhoto)) ? encodeURI(`/${lockPhoto}`) : null
  return <FofaApp pin={pin} lockPhoto={lockUrl} couple={couple} />
}
