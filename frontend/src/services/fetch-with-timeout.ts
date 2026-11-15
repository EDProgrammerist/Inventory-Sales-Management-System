// AbortController works on older mobile browsers that lack AbortSignal.any/timeout.
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  options: RequestInit,
  timeoutMs: number,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const controller = new AbortController()
  const parent = options.signal
  const abort = () => controller.abort()
  if (parent?.aborted) abort()
  else parent?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, timeoutMs)
  try {
    return await fetcher(input, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    parent?.removeEventListener('abort', abort)
  }
}
