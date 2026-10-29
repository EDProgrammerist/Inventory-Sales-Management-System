function csvCell(value: string | number) {
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r\n]/.test(text.trimStart())) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
}
