// Evaluated by Vercel at deployment time, not included in the browser bundle.
const configuredOrigin = process.env.RENDER_API_ORIGIN
let backend
try {
  backend = new URL(configuredOrigin)
} catch {
  throw new Error('Set RENDER_API_ORIGIN to the HTTPS origin of your Render service.')
}
if (backend.protocol !== 'https:' || backend.username || backend.password ||
    backend.pathname !== '/' || backend.search || backend.hash) {
  throw new Error('RENDER_API_ORIGIN must be an HTTPS origin without credentials, a path, query, or fragment.')
}

export const config = {
  framework: 'vite',
  installCommand: 'npm ci',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  headers: [{
    source: '/api/:path*',
    headers: [{key: 'Cache-Control', value: 'private, no-store'}],
  }],
  rewrites: [
    {source: '/api/:path*', destination: `${backend.origin}/api/:path*`},
    {source: '/(.*)', destination: '/index.html'},
  ],
}
