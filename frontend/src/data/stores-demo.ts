export interface Store {
  id: string
  branch: string
  name: string
  address: string
  city: string
  phone: string
}
export const storeFixtures: Store[] = []
export function selectStores(rows: Store[], query: string) {
  const search = query.trim().toLowerCase()
  return rows.filter((row) =>
    `${row.branch} ${row.name} ${row.address} ${row.city} ${row.phone}`
      .toLowerCase()
      .includes(search),
  )
}
export function validateStore(
  input: Record<string, string>,
  existing: Store[],
  editingId?: string,
) {
  const errors: Record<string, string> = {}
  for (const key of ['branch', 'name', 'address', 'city'])
    if (!input[key]?.trim() || input[key].trim().length > 200)
      errors[key] = 'Enter 1–200 characters.'
  const phone = input.phone?.trim() ?? ''
  if (
    !/^\+?[\d\s()-]+$/.test(phone) ||
    phone.replace(/\D/g, '').length < 7 ||
    phone.replace(/\D/g, '').length > 15 ||
    phone.length > 32
  )
    errors.phone = 'Enter a contact number containing 7–15 digits.'
  if (
    existing.some(
      (row) =>
        row.id !== editingId && row.branch.toLowerCase() === input.branch?.trim().toLowerCase(),
    )
  )
    errors.branch = 'This branch already exists.'
  return errors
}
