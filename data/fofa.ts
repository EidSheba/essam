/*
 * Everything the page shows lives in this file. All of it is placeholder content:
 * replace it with your own story.
 *
 * PIN ........ the code that opens the page (checked in the browser, so it keeps casual visitors out; it is not real security)
 * Photos ..... put image files in public/couples/fofa/ and list them below
 *              (a missing file shows a gradient placeholder instead)
 * Songs ...... either `spotify` (a track id) or title + artist (cover art and a 30s preview are fetched automatically)
 */

export interface Photo { src: string; caption: string; date?: string }
export interface Song {
  /** Text under the disc. Leave title, artist and line empty ('') to show nothing. */
  title: string
  artist: string
  line: string
  hue: number
  /** Optional overrides. By default the cover and a 30s preview are fetched automatically. */
  cover?: string
  audio?: string
  /** Spotify track id (the part after /track/ in the share link): plays the real song inside the site. */
  spotify?: string
  /** Where to start the Spotify track, in seconds. */
  startAt?: number
}
export interface Envelope { when: string; text: string }

export interface CoupleData {
  pin: string
  /** The photo inside the heart on the lock screen. It sharpens as the PIN is typed. */
  lockPhoto: string
  him: string
  her: string
  /** When the story began (drives the live clock). Local time. */
  since: string
  /** Month and day of the anniversary countdown (the year is ignored). */
  anniversary: string
  tagline: string
  photos: Required<Photo>[]
  together: Photo[]
  songs: Song[]
  reasons: string[]
  envelopes: Envelope[]
  letter: string[]
  signature: string
}

export const fofa: CoupleData = {
  pin: '1234',
  lockPhoto: 'couples/fofa/moment-1.jpg',

  him: 'Adam',
  her: 'Sara',

  since: '2024-02-14T00:00:00',
  anniversary: '2024-02-14',

  tagline: 'Two hearts, one story, still being written.',

  photos: [
    { src: 'couples/fofa/moment-1.jpg', caption: 'The day we met', date: '14 Feb 2024' },
    { src: 'couples/fofa/moment-2.jpg', caption: 'Our first date', date: '02 Mar 2024' },
    { src: 'couples/fofa/moment-3.jpg', caption: 'Our first trip', date: '18 Apr 2024' },
    { src: 'couples/fofa/moment-4.jpg', caption: 'A quiet evening', date: '09 Jun 2024' },
    { src: 'couples/fofa/moment-5.jpg', caption: 'The day you said yes', date: '21 Aug 2024' },
    { src: 'couples/fofa/moment-6.jpg', caption: 'Our first celebration', date: '05 Oct 2024' },
  ],

  // The "Us" photo deck (chapter two).
  together: [
    { src: 'couples/fofa/together-1.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-2.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-3.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-4.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-5.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-6.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-7.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-8.jpg', caption: 'Us' },
    { src: 'couples/fofa/together-9.jpg', caption: 'Us' },
  ],

  songs: [
    { title: '', artist: '', line: '', hue: 345, spotify: '4EwiYfAGAXFRYJvQmagM7D', startAt: 67, cover: 'https://i.scdn.co/image/ab67616d0000b2736711034c0ed23376848f1fee' },
    { title: '', artist: '', line: '', hue: 345, spotify: '0AVdTy2X1vIzRP6wjBuzso', startAt: 0, cover: 'https://i.scdn.co/image/ab67616d0000b273184b0c5e437b7532db044395' },
    { title: '', artist: '', line: '', hue: 345, spotify: '6ddGkMo85kRvTRH5bRBlqs', startAt: 0, cover: 'https://i.scdn.co/image/ab67616d0000b27364ce5349af3ad91381a8bde5' },
  ],

  reasons: [
    'You make every ordinary day feel special',
    'You listen, and you remember the little things',
    'I am always at home when I am with you',
    'Your laugh is my favourite sound',
    'You see the best in me, even when I forget it',
    'Your eyes light up a whole room',
    'You are patient with me on my hardest days',
    'You know exactly how to make me smile',
    'I feel calm and safe by your side',
    'Because it is you, and it always will be ❤️',
  ],

  envelopes: [
    { when: 'you miss me', text: 'Close your eyes. Feel your hand in mine. I am closer than the distance says. Count to ten, then call me.' },
    { when: 'you are sad', text: 'This will pass, and I will be here the whole time. You are loved more than any bad day can undo.' },
    { when: 'you cannot sleep', text: 'Think of the last time we laughed until it hurt. Hold on to that. Goodnight, my love. I am right here.' },
  ],

  letter: [
    'My love,',
    'If you are reading this, you found the way in, and I hope it made you smile before you even got here.',
    'I built this little world so that wherever you are, you can come back to us. To the day we met, the songs we love, the faces we made, and everything still ahead.',
    'Thank you for choosing me, every single day, even on the days I make it difficult. I choose you back. Always. Out loud and in silence.',
  ],
  signature: 'Yours, always',
}
