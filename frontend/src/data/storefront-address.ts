export type AddressType = 'home' | 'office' | 'other'
export interface AddressDraft { name: string; type: AddressType; address: string; phone: string }
export interface StoreAddress extends AddressDraft { id: string }
export type AddressErrors = Partial<Record<keyof AddressDraft, string>>
export const blankAddress: AddressDraft = { name:'', type:'home', address:'', phone:'' }

export function normalizeAddress(draft: AddressDraft): AddressDraft {
  return { name:draft.name.trim(), type:draft.type, address:draft.address.trim(), phone:draft.phone.trim() }
}

export function validateAddress(draft: AddressDraft): AddressErrors {
  const value = normalizeAddress(draft)
  const errors: AddressErrors = {}
  if (value.name.length < 2 || value.name.length > 80) errors.name = 'Enter an address name between 2 and 80 characters.'
  if (!['home','office','other'].includes(value.type)) errors.type = 'Choose Home, Office, or Other.'
  if (value.address.length < 8 || value.address.length > 300) errors.address = 'Enter a full address between 8 and 300 characters.'
  const digits = value.phone.replace(/\D/g, '')
  if (!/^[+\d\s().-]+$/.test(value.phone) || digits.length < 7 || digits.length > 15 || value.phone.length > 30) errors.phone = 'Enter a phone number with 7 to 15 digits.'
  return errors
}
