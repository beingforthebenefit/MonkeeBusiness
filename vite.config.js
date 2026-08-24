import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { showsPlugin } from './scripts/vite-plugin-shows.mjs'

export default defineConfig({
  // Custom domain served from the apex, so assets live at the root.
  base: '/',
  plugins: [
    showsPlugin(),
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        // Structured data is a <script> the minifier must not touch.
        processScripts: ['application/ld+json'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    // One page, one small bundle: inline anything under 4kB rather than paying
    // for another round trip.
    assetsInlineLimit: 4096,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5500,
    open: true,
  },
  preview: {
    port: 5500,
  },
})
