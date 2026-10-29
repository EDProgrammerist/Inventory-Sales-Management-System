export function validBuyingPrice(input: string): boolean {
  const value = Number(input)
  return (
    /^\d+(\.\d{1,2})?$/.test(input) && Number.isFinite(value) && value > 0 && value <= 999999999.99
  )
}
