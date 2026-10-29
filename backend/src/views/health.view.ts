export function toRootStatusResponse() {
  return { status: 'success', timestamp: new Date().toISOString() }
}

export function toHealthResponse() {
  return { status: 'success', message: 'API is healthy', timestamp: new Date().toISOString() }
}
