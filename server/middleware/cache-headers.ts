// Nitro middleware to set cache headers for CSS assets
import { defineEventHandler, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Match /assets/styles.css (stable filename without hash)
  if (url.pathname === '/assets/styles.css') {
    // Set short cache for CSS to avoid stale cache issues
    // Browsers will revalidate, but still benefit from 304 responses
    event.res.headers.set(
      'Cache-Control',
      'public, max-age=3600, must-revalidate',
    )
  }
})
