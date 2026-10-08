import { joinRoom, selfId } from 'trystero'
import { t, translateStatic } from './i18n.js'
import { confetti } from './confetti.js'
import site from '../site.config.js'
import './style.css'

const APP_ID = 'openestimate-v1'
// Optional: comma-separated Nostr relay URLs used for the WebRTC handshake (defaults to Trystero's public relays).
const RELAYS = (import.meta.env.VITE_NOSTR_RELAYS || '').split(',').map((s) => s.trim()).filter(Boolean)

const DECKS = {
  fibonacci: { label: 'Fibonacci', cards: ['0', '½', '1', '2', '3', '5', '8', '13', '21', '34', '55', '?', '☕'] },
  modified: { label: 'Modified Fibonacci', cards: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'] },
  tshirt: { label: 'T-Shirt', cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'] },
  pow2: { label: 'Powers of 2', cards: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'] },
}

const ICONS = {
  link: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  theme: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  leave: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  logo: '<svg viewBox="0 0 64 64" width="28" height="28"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22c3a6"/></linearGradient></defs><rect x="14" y="6" width="36" height="50" rx="7" fill="url(#lg)" transform="rotate(12 32 32)"/><rect x="10" y="8" width="36" height="50" rx="7" fill="#fff" stroke="#7c5cff" stroke-width="3"/><text x="28" y="42" font-family="system-ui,sans-serif" font-size="24" font-weight="800" text-anchor="middle" fill="#7c5cff">5</text></svg>',
}

// ---------- helpers ----------

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('opp:' + key)
      return v == null ? fallback : JSON.parse(v)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('opp:' + key, JSON.stringify(value))
    } catch {}
  },
}

function h(html) {
  const tpl = document.createElement('template')
  tpl.innerHTML = html.trim()
  return tpl.content.firstElementChild
}

const $ = (sel, root = document) => root.querySelector(sel)

function randomRoomId() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  const s = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return `${s.slice(0, 5)}-${s.slice(5)}`
}

function parseRoomId(input) {
  const s = String(input || '').trim()
  const fromHash = s.includes('#') ? s.slice(s.lastIndexOf('#') + 1) : s
  const id = fromHash.replace(/^\/+/, '').toLowerCase()
  return /^[a-z0-9-]{4,64}$/.test(id) ? id : null
}

function inviteLink(roomId) {
  return `${location.origin}${location.pathname}#${roomId}`
}

function toast(msg) {
  const el = h(`<div class="toast"></div>`)
  el.textContent = msg
  $('#toasts').append(el)
  setTimeout(() => el.classList.add('out'), 2600)
  setTimeout(() => el.remove(), 3000)
}

function toggleTheme() {
  const root = document.documentElement
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  store.set('theme', root.dataset.theme)
}

const cleanName = (s) => String(s || '').trim().slice(0, 24)
const cardValue = (c) => (c === '½' ? 0.5 : /^\d+$/.test(c) ? Number(c) : null)

// ---------- routing ----------

const app = $('#app')
let session = null

const BMC_URL = /^https?:\/\//.test(site.buyMeACoffee || '')
  ? site.buyMeACoffee
  : site.buyMeACoffee ? `https://buymeacoffee.com/${encodeURIComponent(site.buyMeACoffee)}` : ''
const HOME_TITLE = document.title

function route() {
  session?.destroy()
  session = null
  const id = parseRoomId(location.hash.slice(1))
  document.body.classList.toggle('in-room', !!id)
  scrollTo(0, 0)
  if (id) {
    if (store.get('name', '')) enterRoom(id)
    else renderJoin(id)
  } else {
    renderHome()
  }
}

window.addEventListener('hashchange', route)
window.addEventListener('pagehide', () => session?.destroy())

// ---------- home ----------

function renderHome() {
  document.title = HOME_TITLE
  const deckOptions = Object.entries(DECKS)
    .map(([k, d]) => `<option value="${k}">${d.label} (${d.cards.slice(0, 6).join(', ')}…)</option>`)
    .join('')
  app.replaceChildren(
    h(`
    <main class="home">
      <button class="icon-btn theme-btn" title="${t('toggleTheme')}">${ICONS.theme}</button>
      <div class="hero">
        <div class="fan" aria-hidden="true">
          <span>3</span><span>5</span><span>8</span><span>13</span><span>?</span>
        </div>
        <h1>OpenEstimate</h1>
        <p class="tagline">${t('tagline')}</p>
      </div>
      <section class="panel">
        <form class="create">
          <label>${t('yourName')}<input name="name" maxlength="24" required autocomplete="nickname" placeholder="${t('namePlaceholder')}"></label>
          <label>${t('deck')}<select name="deck">${deckOptions}</select></label>
          <button class="btn primary big" type="submit">${t('createRoom')}</button>
        </form>
        <div class="divider"><span>${t('or')}</span></div>
        <form class="join">
          <input name="room" required placeholder="${t('joinPlaceholder')}">
          <button class="btn" type="submit">${t('join')}</button>
        </form>
      </section>
      <p class="note">🔒 ${t('p2pNote')}</p>
    </main>`),
  )
  const create = $('form.create')
  create.name.value = store.get('name', '')
  create.deck.value = store.get('deck', 'fibonacci')
  $('.theme-btn').onclick = toggleTheme
  create.onsubmit = (e) => {
    e.preventDefault()
    store.set('name', cleanName(create.name.value))
    store.set('deck', create.deck.value)
    const id = randomRoomId()
    store.set('room:' + id, initialState(create.deck.value, 1))
    location.hash = id
  }
  $('form.join').onsubmit = (e) => {
    e.preventDefault()
    const input = e.target.room
    const id = parseRoomId(input.value)
    if (id) location.hash = id
    else input.setCustomValidity('?'), input.reportValidity(), setTimeout(() => input.setCustomValidity(''), 1500)
  }
}

// ---------- join (name prompt) ----------

function renderJoin(roomId) {
  app.replaceChildren(
    h(`
    <main class="home">
      <div class="hero small">
        <h1>${t('joinRoom')}</h1>
        <p class="room-code"></p>
      </div>
      <section class="panel">
        <form class="create">
          <label>${t('yourName')}<input name="name" maxlength="24" required autofocus autocomplete="nickname" placeholder="${t('namePlaceholder')}"></label>
          <label class="check"><input type="checkbox" name="spectator"> ${t('spectator')}</label>
          <button class="btn primary big" type="submit">${t('enter')}</button>
        </form>
      </section>
    </main>`),
  )
  $('.room-code').textContent = roomId
  const form = $('form.create')
  form.onsubmit = (e) => {
    e.preventDefault()
    store.set('name', cleanName(form.name.value))
    store.set('spectator', form.spectator.checked)
    enterRoom(roomId)
  }
}

// ---------- room ----------

function initialState(deck = 'fibonacci', clock = 0) {
  return { round: 1, revealed: false, topic: '', deck, clock, by: '' }
}

const isNewer = (a, b) => a.clock > b.clock || (a.clock === b.clock && a.by > b.by)

function validState(s) {
  return (
    s &&
    Number.isInteger(s.round) &&
    typeof s.revealed === 'boolean' &&
    typeof s.topic === 'string' &&
    DECKS[s.deck] &&
    Number.isInteger(s.clock) &&
    typeof s.by === 'string'
  )
}

function enterRoom(roomId) {
  session = createSession(roomId)
}

function createSession(roomId) {
  document.title = `${roomId} · OpenEstimate`

  let state = store.get('room:' + roomId, null)
  if (!validState(state)) state = initialState(store.get('deck', 'fibonacci'))
  state.revealed = false // never resume into a revealed round alone

  const me = {
    name: store.get('name', '') || t('anonymous'),
    spectator: !!store.get('spectator', false),
    vote: null,
    round: state.round,
  }
  const peers = new Map() // peerId -> player

  const room = joinRoom(
    { appId: APP_ID, password: 'opp:' + roomId, ...(RELAYS.length && { relayConfig: { urls: RELAYS } }) },
    roomId,
  )
  const playerAction = room.makeAction('player')
  const stateAction = room.makeAction('state')

  // --- layout ---
  const view = h(`
    <div class="room">
      <header class="topbar">
        <a class="brand" href="#">${ICONS.logo}<span>OpenEstimate</span></a>
        <div class="status"><span class="dot"></span><span class="status-text"></span></div>
        <div class="actions">
          <button class="btn invite">${ICONS.link}<span>${t('invite')}</span></button>
          <select class="deck-select" title="${t('deck')}">${Object.entries(DECKS)
            .map(([k, d]) => `<option value="${k}">${d.label}</option>`)
            .join('')}</select>
          ${BMC_URL ? `<a class="icon-btn coffee-btn" href="${BMC_URL}" target="_blank" rel="noopener" title="${t('coffee')}">${ICONS.coffee}</a>` : ''}
          <button class="icon-btn theme-btn" title="${t('toggleTheme')}">${ICONS.theme}</button>
          <a class="icon-btn" href="#" title="${t('leave')}">${ICONS.leave}</a>
        </div>
      </header>
      <main class="board">
        <input class="topic" maxlength="120" placeholder="${t('topicPlaceholder')}">
        <div class="table-wrap">
          <div class="seats"></div>
          <div class="table">
            <div class="table-info"></div>
            <button class="btn primary big table-btn"></button>
          </div>
        </div>
        <section class="results"></section>
      </main>
      <footer class="hand">
        <div class="hand-head">
          <span class="hand-label"></span>
          <span class="me-name"><input class="name-input" maxlength="24" aria-label="${t('yourName')}"><button class="btn small role-btn"></button></span>
        </div>
        <div class="cards"></div>
        <nav class="legal-links">
          <a href="./datenschutz.html">${t('privacy')}</a>
          ${site.owner?.name ? `<a href="./impressum.html">${t('imprint')}</a>` : ''}
          ${BMC_URL ? `<a class="bmc-link" href="${BMC_URL}" target="_blank" rel="noopener">${ICONS.coffee}<span>Buy me a coffee</span></a>` : ''}
        </nav>
      </footer>
    </div>`)
  app.replaceChildren(view)

  const el = {
    status: $('.status', view),
    statusText: $('.status-text', view),
    topic: $('.topic', view),
    seats: $('.seats', view),
    tableInfo: $('.table-info', view),
    tableBtn: $('.table-btn', view),
    results: $('.results', view),
    cards: $('.cards', view),
    handLabel: $('.hand-label', view),
    nameInput: $('.name-input', view),
    roleBtn: $('.role-btn', view),
    deckSelect: $('.deck-select', view),
  }
  const seatEls = new Map()
  let celebratedRound = null
  let confettiTimer
  let stopConfetti
  let renderedDeck = null

  // --- networking ---
  const broadcastMe = (target) => playerAction.send(me, target ? { target } : undefined)
  const broadcastState = (target) => stateAction.send(state, target ? { target } : undefined)

  function saveState() {
    store.set('room:' + roomId, state)
  }

  function syncMyRound() {
    if (me.round !== state.round) {
      me.round = state.round
      me.vote = null
    }
  }

  function changeState(patch) {
    state = { ...state, ...patch, clock: state.clock + 1, by: selfId }
    syncMyRound()
    saveState()
    broadcastState()
    broadcastMe()
    render()
  }

  room.onPeerJoin = (peerId) => {
    broadcastMe(peerId)
    broadcastState(peerId)
  }

  room.onPeerLeave = (peerId) => {
    const p = peers.get(peerId)
    peers.delete(peerId)
    if (p) toast(t('left', p.name))
    render()
  }

  playerAction.onMessage = (data, { peerId }) => {
    if (!data || typeof data !== 'object') return
    const player = {
      name: cleanName(data.name) || t('anonymous'),
      spectator: !!data.spectator,
      vote: typeof data.vote === 'string' ? data.vote.slice(0, 8) : null,
      round: Number.isInteger(data.round) ? data.round : 0,
    }
    if (!peers.has(peerId)) toast(t('joined', player.name))
    peers.set(peerId, player)
    render()
  }

  stateAction.onMessage = (data) => {
    if (!validState(data) || !isNewer(data, state)) return
    state = { ...data, topic: data.topic.slice(0, 120) }
    const roundChanged = me.round !== state.round
    syncMyRound()
    saveState()
    if (roundChanged) broadcastMe()
    render()
  }

  // --- UI events ---
  $('.invite', view).onclick = async () => {
    const url = inviteLink(roomId)
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: t('shareTitle'), url })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      toast(t('linkCopied'))
    } catch {
      prompt(t('copy'), url)
    }
  }
  $('.theme-btn', view).onclick = toggleTheme
  el.deckSelect.onchange = () => {
    store.set('deck', el.deckSelect.value)
    changeState({ deck: el.deckSelect.value, round: state.round + 1, revealed: false })
  }
  let topicTimer
  el.topic.oninput = () => {
    clearTimeout(topicTimer)
    topicTimer = setTimeout(() => changeState({ topic: el.topic.value.slice(0, 120) }), 300)
  }
  el.tableBtn.onclick = () => {
    if (state.revealed) changeState({ revealed: false, round: state.round + 1 })
    else changeState({ revealed: true })
  }
  el.nameInput.value = me.name
  el.nameInput.onchange = () => {
    me.name = cleanName(el.nameInput.value) || t('anonymous')
    el.nameInput.value = me.name
    store.set('name', me.name)
    broadcastMe()
    render()
  }
  el.roleBtn.onclick = () => {
    me.spectator = !me.spectator
    if (me.spectator) me.vote = null
    store.set('spectator', me.spectator)
    broadcastMe()
    render()
  }
  el.cards.onclick = (e) => {
    const btn = e.target.closest('button[data-card]')
    if (!btn || me.spectator) return
    me.vote = me.vote === btn.dataset.card ? null : btn.dataset.card
    broadcastMe()
    render()
  }

  // --- rendering ---
  function players() {
    const all = [{ id: selfId, self: true, ...me }]
    for (const [id, p] of peers) all.push({ id, ...p })
    return all
  }

  function voteOf(p) {
    return p.round === state.round ? p.vote : null
  }

  function renderSeat(p) {
    let seat = seatEls.get(p.id)
    if (!seat) {
      seat = h(`
        <div class="seat">
          <div class="pcard"><div class="pcard-inner"><div class="face back"></div><div class="face front"></div></div></div>
          <div class="pname"></div>
        </div>`)
      seatEls.set(p.id, seat)
    }
    const vote = voteOf(p)
    seat.classList.toggle('self', !!p.self)
    seat.classList.toggle('spectator', p.spectator)
    seat.classList.toggle('voted', vote != null)
    seat.classList.toggle('revealed', state.revealed && vote != null)
    $('.front', seat).textContent = vote ?? ''
    $('.back', seat).innerHTML = p.spectator ? ICONS.eye : ''
    $('.pname', seat).textContent = p.self ? `${p.name} (${t('you')})` : p.name
    return seat
  }

  function renderResults(voters) {
    const votes = voters.map(voteOf).filter((v) => v != null)
    if (!state.revealed) {
      el.results.classList.remove('show')
      return
    }
    el.results.classList.add('show')
    if (!votes.length) {
      el.results.innerHTML = `<p class="muted">${t('noVotes')}</p>`
      return
    }
    const counts = new Map()
    for (const v of votes) counts.set(v, (counts.get(v) || 0) + 1)
    const deckCards = DECKS[state.deck].cards
    const sorted = [...counts].sort((a, b) => deckCards.indexOf(a[0]) - deckCards.indexOf(b[0]))
    const max = Math.max(...counts.values())
    const numeric = votes.map(cardValue).filter((v) => v != null)
    const avg = numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : null
    let suggestion = null
    if (avg != null) {
      const candidates = deckCards.filter((c) => cardValue(c) != null)
      suggestion = candidates.reduce((best, c) =>
        Math.abs(cardValue(c) - avg) < Math.abs(cardValue(best) - avg) ? c : best,
      )
    } else {
      suggestion = sorted.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0]
    }
    const consensus = counts.size === 1 && votes.length > 1
    if (consensus && celebratedRound !== state.round) {
      // Once per round, timed to land right after the cards have flipped.
      celebratedRound = state.round
      clearTimeout(confettiTimer)
      confettiTimer = setTimeout(() => (stopConfetti = confetti()), 450)
    }
    const agreement = Math.round((max / votes.length) * 100)

    el.results.innerHTML = `
      <div class="stats">
        ${avg != null ? `<div class="stat"><span class="label">${t('average')}</span><span class="value">${+avg.toFixed(1)}</span></div>` : ''}
        <div class="stat"><span class="label">${t('suggestion')}</span><span class="value accent"></span></div>
        <div class="stat"><span class="label">${t('agreement')}</span><span class="value">${agreement}%</span></div>
      </div>
      ${consensus ? `<div class="consensus">🎉 ${t('consensus')}</div>` : ''}
      <div class="bars"></div>`
    $('.value.accent', el.results).textContent = suggestion
    const bars = $('.bars', el.results)
    for (const [value, n] of sorted) {
      const bar = h(`<div class="bar"><div class="bar-track"><div class="bar-fill"></div></div><div class="bar-card"></div><div class="bar-count"></div></div>`)
      $('.bar-fill', bar).style.height = `${(n / max) * 100}%`
      $('.bar-card', bar).textContent = value
      $('.bar-count', bar).textContent = `${n}×`
      bars.append(bar)
    }
  }

  function render() {
    const all = players()
    const voters = all.filter((p) => !p.spectator)
    const votedCount = voters.filter((p) => voteOf(p) != null).length

    // status
    const n = peers.size
    el.status.classList.toggle('online', n > 0)
    el.statusText.textContent = n ? t('connected', n) : t('alone')

    // topic (don't fight the user while typing)
    if (document.activeElement !== el.topic) el.topic.value = state.topic
    el.deckSelect.value = state.deck

    // seats
    const sortedPlayers = all.sort((a, b) => a.spectator - b.spectator || a.name.localeCompare(b.name))
    // Order via CSS so existing seats are never re-inserted (that would restart their animations).
    sortedPlayers.forEach((p, i) => {
      const seat = renderSeat(p)
      seat.style.order = i
      if (!seat.isConnected) el.seats.append(seat)
    })
    for (const [id, seat] of seatEls) {
      if (id !== selfId && !peers.has(id)) {
        seat.remove()
        seatEls.delete(id)
      }
    }

    // table
    el.tableInfo.textContent = t('voted', votedCount, voters.length)
    el.tableBtn.textContent = state.revealed ? t('newRound') : t('reveal')
    el.tableBtn.classList.toggle('ready', !state.revealed && votedCount > 0 && votedCount === voters.length)

    renderResults(voters)

    // hand
    if (renderedDeck !== state.deck) {
      renderedDeck = state.deck
      el.cards.replaceChildren(
        ...DECKS[state.deck].cards.map((c) => {
          const b = h(`<button class="card" data-card=""></button>`)
          b.dataset.card = c
          b.textContent = c
          return b
        }),
      )
    }
    for (const b of el.cards.children) b.classList.toggle('selected', b.dataset.card === me.vote)
    el.cards.classList.toggle('disabled', me.spectator)
    el.handLabel.textContent = me.spectator ? t('spectating') : t('pickCard')
    el.roleBtn.textContent = me.spectator ? t('becomePlayer') : t('becomeSpectator')
  }

  render()

  return {
    destroy() {
      clearTimeout(topicTimer)
      clearTimeout(confettiTimer)
      stopConfetti?.()
      room.leave()
    },
  }
}

translateStatic()
route()
