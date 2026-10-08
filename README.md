# OpenEstimate

A lightweight, good-looking planning poker app for agile teams – **no backend, no sign-up**.
Create a room, share the link, estimate together.

**Live:** https://openestimate.de/

## Features

- Create rooms with one click and invite people via link (or room code)
- Card decks: Fibonacci, Modified Fibonacci, T-Shirt sizes, Powers of 2
- Hidden votes, synchronized reveal with flip animation
- Results: average, suggested card, agreement and distribution
- Shared story/topic field, spectator mode, live presence
- Light & dark mode, mobile friendly, German & English UI
- ~30 kB gzipped

## How it works (no server)

The app is a static site hosted on GitHub Pages. Browsers in the same room talk to each other
directly over **WebRTC** using [Trystero](https://github.com/dmotz/trystero). The initial
handshake is exchanged through public [Nostr](https://nostr.com) relays (encrypted with a key
derived from the room code); after that, all data flows peer-to-peer. Nothing is stored on a server.

Room state (round, reveal status, topic, deck) is replicated to all peers with a simple
last-writer-wins clock, so there is no "host" – anyone can reveal or start a new round,
and the room keeps working when people leave.

> Note: very restrictive corporate networks that block WebRTC may prevent peers from connecting.

## Configuration

All site settings live in [`site.config.js`](site.config.js):

| Setting | Purpose |
| --- | --- |
| `url` | Public URL – used for canonical link, sitemap and social previews |
| `buyMeACoffee` | Your Buy Me a Coffee username – shows the coffee button when set |
| `owner` | Name, address and e-mail for the **Impressum** and privacy policy – the Impressum page and links appear once `name` is set |
| `googleSiteVerification` | Optional Google Search Console verification token |

Edit, commit, push – the site redeploys automatically.

## SEO

- Descriptive title/description, canonical URL, Open Graph & Twitter cards with a preview image
- JSON-LD (`WebApplication` + `FAQPage`) for rich results
- Crawlable landing content (features, how-to, FAQ) in plain HTML, translated to German at runtime
- `sitemap.xml` and `robots.txt` are generated at build time – submit the sitemap in Google Search Console

## Privacy

No backend, no database, no analytics, no cookies. See [`datenschutz.html`](datenschutz.html) for exactly which third
parties technically see an IP address (GitHub Pages, public Nostr relays, STUN servers, the other peers in a room).

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Optionally use your own Nostr relays for the handshake:

```bash
VITE_NOSTR_RELAYS=wss://relay.example.com,wss://relay2.example.com npm run build
```

## Deployment

Pushes to `main` are built and deployed by `.github/workflows/deploy.yml` to GitHub Pages,
served under the custom domain configured in **Settings → Pages** (`url` in `site.config.js` must match).

## License

[MIT](LICENSE). Licenses of bundled third-party libraries are published with the app as `licenses.txt`.

Planning Poker® is a registered trademark of Mountain Goat Software, LLC. OpenEstimate is an independent
project and is not affiliated with Mountain Goat Software.

