export function paginateRows<T>(rows: T[], requestedPage: number, pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1)
    throw new Error('Page size must be a positive integer')
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Number.isInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, totalPages))
    : 1
  return { page, totalPages, rows: rows.slice((page - 1) * pageSize, page * pageSize) }
}
