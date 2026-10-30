const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

export function formatMoney(value: number): string {
  return formatter.format(value)
}
