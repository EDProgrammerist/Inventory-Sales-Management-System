import { decodeCatalog } from '@/data/storefront-catalog'
import { apiBaseUrl as base } from './api-base'
import { fetchWithTimeout } from './fetch-with-timeout'

export async function loadCatalog(signal: AbortSignal, fetcher: typeof fetch = fetch) {
  if (!base) throw new Error('The catalog service is not configured. Please try again later.')
  let response: Response
  try {
    response = await fetchWithTimeout(`${base}/catalog/v1/products`, {signal,cache:'no-store',credentials:'omit'},15000,fetcher)
  } catch (error) {
    if (signal.aborted) throw error
    throw new Error('Unable to load products. Please check your connection and try again.', {cause:error})
  }
  if (!response.ok) throw new Error('The catalog service is unavailable. Please try again.')
  const result = await response.json().catch(() => { throw new Error('The catalog service returned an invalid response. Please try again.') })
  return decodeCatalog(result?.data)
}
