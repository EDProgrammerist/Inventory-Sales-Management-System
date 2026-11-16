import { decodeCatalog } from '@/data/storefront-catalog'
import { apiBaseUrl as base } from './api-base'
import { fetchWithTimeout } from './fetch-with-timeout'

function waitForRetry(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The request was aborted.', 'AbortError'))
      return
    }
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('The request was aborted.', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, 1000)
    signal.addEventListener('abort', abort, { once: true })
  })
}

export async function loadCatalog(signal: AbortSignal, fetcher: typeof fetch = fetch) {
  if (!base) throw new Error('The catalog service is not configured. Please try again later.')
  // Only this public GET is retried. Five attempts allow a sleeping demo service
  // time to start without automatically repeating purchases or other writes.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (signal.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    let response: Response
    try {
      response = await fetchWithTimeout(`${base}/catalog/v1/products`, {signal,cache:'no-store',credentials:'omit'},15000,fetcher)
    } catch (error) {
      if (signal.aborted) throw error
      if (attempt < 4) {
        await waitForRetry(signal)
        continue
      }
      throw new Error('Unable to load products. The store is taking longer than expected to respond. Please try again shortly.', {cause:error})
    }
    if ([408, 500, 502, 503, 504].includes(response.status) && attempt < 4) {
      await response.body?.cancel().catch(() => {})
      await waitForRetry(signal)
      continue
    }
    if (!response.ok) throw new Error('The catalog service is unavailable. Please try again shortly.')
    const result = await response.json().catch(() => { throw new Error('The catalog service returned an invalid response. Please try again.') })
    return decodeCatalog(result?.data)
  }
  throw new Error('The catalog service is unavailable. Please try again shortly.')
}
