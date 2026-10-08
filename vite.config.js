import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import site from './site.config.js'

const hasImprint = Boolean(site.owner?.name)
// Accepts a Buy Me a Coffee username or a full URL.
const bmcUrl = /^https?:\/\//.test(site.buyMeACoffee || '')
  ? site.buyMeACoffee
  : site.buyMeACoffee ? `https://buymeacoffee.com/${site.buyMeACoffee}` : ''

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Collects the license texts of all runtime dependencies (they are bundled into the app, so their notices must ship too).
function thirdPartyLicenses() {
  const require = createRequire(import.meta.url)
  const seen = new Map()
  const visit = (name, from) => {
    if (seen.has(name)) return
    const pkgPath = createRequire(from).resolve(`${name}/package.json`)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const dir = dirname(pkgPath)
    const file = readdirSync(dir).find((f) => /^licen[cs]e/i.test(f))
    seen.set(name, { pkg, text: file ? readFileSync(resolve(dir, file), 'utf8').trim() : `License: ${pkg.license}` })
    for (const dep of Object.keys(pkg.dependencies || {})) visit(dep, pkgPath)
  }
  const root = require('./package.json')
  for (const dep of Object.keys(root.dependencies || {})) visit(dep, import.meta.url)
  const own = readFileSync(resolve(import.meta.dirname, 'LICENSE'), 'utf8').trim()
  const parts = [...seen.values()]
    .sort((a, b) => a.pkg.name.localeCompare(b.pkg.name))
    .map(({ pkg, text }) => `${pkg.name}@${pkg.version} (${pkg.license})\n${'-'.repeat(60)}\n${text}`)
  return `OpenEstimate\n${'='.repeat(60)}\n${own}\n\n\nThird-party software included in this app\n${'='.repeat(60)}\n\n${parts.join('\n\n\n')}\n`
}

// Fills {{placeholders}} from site.config.js and drops <!--if:key-->…<!--endif:key--> blocks whose flag is off.
function sitePlugin() {
  const vars = {
    SITE_URL: site.url,
    OWNER_NAME: site.owner?.name,
    OWNER_STREET: site.owner?.street,
    OWNER_CITY: site.owner?.city,
    OWNER_COUNTRY: site.owner?.country,
    OWNER_EMAIL: site.owner?.email,
    GOOGLE_SITE_VERIFICATION: site.googleSiteVerification,
    BMC_URL: bmcUrl,
    YEAR: new Date().getFullYear(),
  }
  const flags = {
    imprint: hasImprint,
    'no-imprint': !hasImprint,
    'google-verification': Boolean(site.googleSiteVerification),
    bmc: Boolean(bmcUrl),
  }
  return {
    name: 'site-config',
    transformIndexHtml(html) {
      return html
        .replace(/<!--if:([\w-]+)-->([\s\S]*?)<!--endif:\1-->/g, (_, key, body) => (flags[key] ? body : ''))
        .replace(/\{\{(\w+)\}\}/g, (_, key) => esc(vars[key]))
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'licenses.txt', source: thirdPartyLicenses() })
      const pages = ['', 'datenschutz.html', ...(hasImprint ? ['impressum.html'] : [])]
      const today = new Date().toISOString().slice(0, 10)
      const urls = pages
        .map((p) => `  <url><loc>${site.url}${p}</loc><lastmod>${today}</lastmod>${p ? '' : '<priority>1.0</priority>'}</url>`)
        .join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

// Relative base so the build works on https://<user>.github.io/<repo>/ and any other path.
export default defineConfig({
  base: './',
  plugins: [sitePlugin()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        datenschutz: resolve(import.meta.dirname, 'datenschutz.html'),
        ...(hasImprint && { impressum: resolve(import.meta.dirname, 'impressum.html') }),
      },
    },
  },
})
