import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import site from './site.config.js'

const hasImprint = Boolean(site.owner?.name)

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

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
    BMC_URL: site.buyMeACoffee ? `https://buymeacoffee.com/${site.buyMeACoffee}` : '',
    YEAR: new Date().getFullYear(),
  }
  const flags = {
    imprint: hasImprint,
    'no-imprint': !hasImprint,
    'google-verification': Boolean(site.googleSiteVerification),
    bmc: Boolean(site.buyMeACoffee),
  }
  return {
    name: 'site-config',
    transformIndexHtml(html) {
      return html
        .replace(/<!--if:([\w-]+)-->([\s\S]*?)<!--endif:\1-->/g, (_, key, body) => (flags[key] ? body : ''))
        .replace(/\{\{(\w+)\}\}/g, (_, key) => esc(vars[key]))
    },
    generateBundle() {
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
