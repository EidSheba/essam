# Card

A private, password-protected love-story page: PIN lock, live "together since" counter, polaroid moments,
a photo deck, songs, a message bottle and a final letter.

All the content is placeholder content. Nothing here is personal.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out, ready to upload to any host
```

## Make it yours

Everything is in **`data/fofa.ts`**:

| What | Where in the file |
| --- | --- |
| The PIN (4 digits) | `pin` (default `1234`) |
| Names, start date, anniversary | `him`, `her`, `since`, `anniversary` |
| Photos | put files in `public/couples/fofa/`, then list them in `photos`, `together` and `lockPhoto` |
| Songs | `songs`: a Spotify track id, or a title + artist (cover and a 30s preview load automatically) |
| Reasons, envelopes, letter | `reasons`, `envelopes`, `letter`, `signature` |

A photo whose file is missing shows a gradient placeholder, so you can add them one at a time.

The sample photos in `public/couples/fofa/` are stock images. Replace them with yours.

## Good to know

- The PIN is checked in the browser. It keeps casual visitors out, but it is **not real security**:
  anyone who reads the page's JavaScript can find the PIN and the content.
- The page is marked `noindex`, so search engines are asked to skip it.
- Fonts (Fraunces, Caveat, Outfit) are bundled in `app/fonts/`, so building never needs Google Fonts.
- Design lives in `components/fofa/fofa.module.css`.
