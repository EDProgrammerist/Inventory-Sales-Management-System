// Production requests stay on the frontend origin; Vercel forwards /api to Render.
export const apiBaseUrl = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
