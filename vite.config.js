import { defineConfig } from 'vite'

// Relative base so the build works on https://<user>.github.io/<repo>/ and any other path.
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
})
