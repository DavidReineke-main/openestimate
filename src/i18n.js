const strings = {
  en: {
    tagline: 'Estimate together. No sign-up, no server – just share a link.',
    yourName: 'Your name',
    namePlaceholder: 'e.g. Alex',
    deck: 'Card deck',
    createRoom: 'Create room',
    or: 'or',
    joinPlaceholder: 'Room code or invite link',
    join: 'Join',
    joinRoom: 'Join room',
    spectator: 'Join as spectator',
    enter: "Let's go",
    invite: 'Invite',
    linkCopied: 'Invite link copied',
    topicPlaceholder: 'What are we estimating? (optional)',
    reveal: 'Reveal cards',
    newRound: 'New round',
    voted: (n, m) => `${n} of ${m} voted`,
    pickCard: 'Pick a card',
    spectating: 'You are spectating',
    average: 'Average',
    suggestion: 'Suggestion',
    agreement: 'Agreement',
    consensus: 'Consensus!',
    noVotes: 'No votes yet',
    alone: 'Waiting for others – share the invite link',
    connected: (n) => `${n} other${n === 1 ? '' : 's'} connected`,
    joined: (name) => `${name} joined`,
    left: (name) => `${name} left`,
    anonymous: 'Anonymous',
    you: 'you',
    settings: 'Settings',
    leave: 'Leave room',
    toggleTheme: 'Toggle theme',
    becomeSpectator: 'Spectate',
    becomePlayer: 'Play',
    copy: 'Copy',
    shareTitle: 'Join my Planning Poker room',
    coffee: 'Buy me a coffee',
    privacy: 'Privacy',
    imprint: 'Imprint',
  },
  de: {
    tagline: 'Gemeinsam schätzen. Ohne Anmeldung, ohne Server – einfach Link teilen.',
    yourName: 'Dein Name',
    namePlaceholder: 'z. B. Alex',
    deck: 'Kartenset',
    createRoom: 'Raum erstellen',
    or: 'oder',
    joinPlaceholder: 'Raumcode oder Einladungslink',
    join: 'Beitreten',
    joinRoom: 'Raum beitreten',
    spectator: 'Als Zuschauer beitreten',
    enter: 'Los geht’s',
    invite: 'Einladen',
    linkCopied: 'Einladungslink kopiert',
    topicPlaceholder: 'Was schätzen wir? (optional)',
    reveal: 'Karten aufdecken',
    newRound: 'Neue Runde',
    voted: (n, m) => `${n} von ${m} haben gewählt`,
    pickCard: 'Wähle eine Karte',
    spectating: 'Du schaust zu',
    average: 'Durchschnitt',
    suggestion: 'Vorschlag',
    agreement: 'Einigkeit',
    consensus: 'Konsens!',
    noVotes: 'Noch keine Stimmen',
    alone: 'Warte auf andere – teile den Einladungslink',
    connected: (n) => `${n} ${n === 1 ? 'Person' : 'Personen'} verbunden`,
    joined: (name) => `${name} ist beigetreten`,
    left: (name) => `${name} hat den Raum verlassen`,
    anonymous: 'Anonym',
    you: 'du',
    settings: 'Einstellungen',
    leave: 'Raum verlassen',
    toggleTheme: 'Design wechseln',
    becomeSpectator: 'Zuschauen',
    becomePlayer: 'Mitspielen',
    copy: 'Kopieren',
    shareTitle: 'Komm in meinen Planning-Poker-Raum',
    coffee: 'Spendier mir einen Kaffee',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
  },
}

// German translations for the static, crawlable content in index.html (English lives in the HTML itself).
const staticDe = {
  trustFree: '100 % kostenlos',
  trustTracking: 'Kein Tracking, keine Cookies',
  trustBackend: 'Kein Backend, keine Datenbank',
  trustOss: 'Open Source',
  aboutTitle: 'Kostenloses Online-Planning-Poker für agile Teams',
  aboutLead:
    'OpenEstimate ist eine schnelle, schöne Scrum-Poker-App für Sprint Planning und Story-Point-Schätzungen. Raum erstellen, Link ans Team schicken und losschätzen – ohne Konto, Werbung oder Tracking. Die Stimmen gehen direkt von Browser zu Browser, nichts landet auf einem Server.',
  f1t: 'Räume mit einem Klick',
  f1p: 'Raum erstellen und das Team per Link oder Raumcode einladen. Niemand muss sich registrieren.',
  f2t: 'Alle gängigen Kartensets',
  f2p: 'Fibonacci, modifiziertes Fibonacci, T-Shirt-Größen und Zweierpotenzen – plus „?“ und Kaffeepause.',
  f3t: 'Faire, verdeckte Abstimmung',
  f3p: 'Die Karten bleiben verdeckt, bis jemand sie für alle gleichzeitig aufdeckt.',
  f4t: 'Sofort Ergebnisse',
  f4p: 'Durchschnitt, Kartenvorschlag, Einigkeit und Verteilung direkt nach dem Aufdecken.',
  f5t: 'Privat by Design',
  f5p: 'Peer-to-Peer per WebRTC. Kein Backend, keine Datenbank, keine Analyse-Tools, keine Cookies.',
  f6t: 'Läuft überall',
  f6p: 'Desktop oder Handy, hell oder dunkel, Deutsch oder Englisch – direkt im Browser.',
  howTitle: 'So funktioniert’s',
  how1: '<strong>Raum erstellen</strong> und Kartenset wählen.',
  how2: '<strong>Einladungslink teilen</strong> mit deinem Team.',
  how3: '<strong>Abstimmen, aufdecken, diskutieren</strong> – dann die nächste Runde starten.',
  faqTitle: 'Häufige Fragen',
  q1: 'Ist OpenEstimate wirklich kostenlos?',
  a1: 'Ja. Komplett kostenlos und Open Source – keine Bezahlpläne, keine Werbung, keine Begrenzung bei Räumen oder Teilnehmenden.',
  q2: 'Brauche ich ein Konto?',
  a2: 'Nein. Name eingeben, Raum erstellen, Einladungslink teilen. Niemand muss sich anmelden.',
  q3: 'Werden meine Daten gespeichert oder getrackt?',
  a3: 'Nein. Es gibt kein Backend, keine Datenbank, keine Analyse-Tools und keine Cookies. Die Stimmen gehen per WebRTC direkt zwischen den Browsern der Teilnehmenden hin und her. Details stehen in der <a href="./datenschutz.html">Datenschutzerklärung</a>.',
  q4: 'Wie viele Personen passen in einen Raum?',
  a4: 'Übliche Scrum-Teams bis etwa 15–20 Personen funktionieren gut. Da sich alle direkt verbinden, hängen sehr große Gruppen von den Browsern und Netzwerken der Teilnehmenden ab.',
  q5: 'Was ist Planning Poker?',
  a5: 'Planning Poker (auch Scrum Poker) ist eine Konsens-Technik zum Schätzen von Aufwänden in agilen Teams. Alle wählen verdeckt eine Karte, alle Karten werden gleichzeitig aufgedeckt und Unterschiede werden besprochen.',
  supportText: 'OpenEstimate ist kostenlos und bleibt es auch. Wenn es deinem Team Zeit spart, kannst du mir einen Kaffee spendieren.',
  supportBtn: 'Spendier mir einen Kaffee',
  privacy: 'Datenschutz',
  imprint: 'Impressum',
  licenses: 'Lizenzen',
  trademark:
    'Planning Poker® ist eine eingetragene Marke der Mountain Goat Software, LLC. OpenEstimate ist ein unabhängiges Projekt und steht in keiner Verbindung zu Mountain Goat Software.',
}

export const LANGS = ['de', 'en']

// An explicit choice wins; otherwise the first supported browser language, falling back to English.
function detectLang() {
  try {
    const saved = JSON.parse(localStorage.getItem('opp:lang'))
    if (LANGS.includes(saved)) return saved
  } catch {}
  for (const l of navigator.languages || [navigator.language || '']) {
    const code = String(l).slice(0, 2).toLowerCase()
    if (LANGS.includes(code)) return code
  }
  return 'en'
}

export let lang = detectLang()
document.documentElement.lang = lang

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return
  lang = next
  document.documentElement.lang = lang
  try {
    localStorage.setItem('opp:lang', JSON.stringify(lang))
  } catch {}
  translateStatic()
}

// The static HTML is English; remember it so we can switch back from German.
const originals = new WeakMap()
export function translateStatic(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    if (!originals.has(el)) originals.set(el, el.innerHTML)
    el.innerHTML = (lang === 'de' && staticDe[el.dataset.i18n]) || originals.get(el)
  }
}

export function t(key, ...args) {
  const v = strings[lang][key] ?? strings.en[key] ?? key
  return typeof v === 'function' ? v(...args) : v
}
