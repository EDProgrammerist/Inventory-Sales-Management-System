export interface Store {
  id: string
  branch: string
  name: string
  address: string
  city: string
  phone: string
}
export const storeFixtures: Store[] = [
  {
    id: 'singanallur',
    branch: 'Singanallur Branch',
    name: 'Lisy Store',
    address: '1A/Krishnarajapuram, 3 rd street sulur',
    city: 'Coimbatore - 6313403',
    phone: '044- 653578',
  },
  {
    id: 'slur',
    branch: 'Slur Branch',
    name: 'Lisy Store',
    address: '54 Ramani colony, 3 rd street sulur',
    city: 'Coimbatore - 63133452',
    phone: '044- 653763',
  },
  {
    id: 'gaandipuram',
    branch: 'Gaandipuram Branch',
    name: 'Lisy Store',
    address: '32/ Venkatasamy layout, 3 rd street sulur',
    city: 'Coimbatore - 6313403',
    phone: '044- 653578',
  },
]
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
