import { useRef, useState, type FormEvent } from 'react'
import { blankAddress, validateAddress, type AddressDraft, type AddressErrors, type StoreAddress } from '@/data/storefront-address'

const fields = [
  { key:'name', label:'Address name', autoComplete:'section-delivery organization', maxLength:80 },
  { key:'address', label:'Full address', autoComplete:'section-delivery street-address', maxLength:300 },
  { key:'phone', label:'Phone number', autoComplete:'section-delivery tel', maxLength:30 },
] as const

export default function AddressForm({ initial, onSave, onCancel }: { initial?: StoreAddress; onSave:(draft:AddressDraft) => void; onCancel:() => void }) {
  const [draft, setDraft] = useState<AddressDraft>(initial ?? { ...blankAddress })
  const [errors, setErrors] = useState<AddressErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateAddress(draft)
    setErrors(nextErrors)
    const first = Object.keys(nextErrors)[0]
    if (first) { formRef.current?.querySelector<HTMLElement>(`#address-field-${first}`)?.focus(); return }
    onSave(draft)
  }
  return <form className="address-form" onSubmit={submit} ref={formRef} noValidate aria-labelledby="address-form-title">
    <h2 id="address-form-title">{initial ? 'Edit address' : 'Add New Address'}</h2>
    <div className="address-form-grid">{fields.map(({ key, label, autoComplete, maxLength }) => {
      const props = { id:`address-field-${key}`, name:key, value:draft[key], autoComplete, maxLength, required:true, 'aria-invalid':Boolean(errors[key]), 'aria-describedby':errors[key] ? `address-error-${key}` : undefined, onChange:(event:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setDraft(current => ({ ...current,[key]:event.target.value })); setErrors(current => ({ ...current,[key]:undefined })) } }
      return <div className={`address-field address-field-${key}`} key={key}><label htmlFor={props.id}>{label}</label>{key === 'address' ? <textarea {...props} rows={3} /> : <input {...props} type={key === 'phone' ? 'tel' : 'text'} />}{errors[key] && <p id={`address-error-${key}`} className="address-error">{errors[key]}</p>}</div>
    })}<div className="address-field"><label htmlFor="address-field-type">Address type</label><select id="address-field-type" value={draft.type} onChange={event => setDraft(current => ({ ...current,type:event.target.value as AddressDraft['type'] }))}><option value="home">Home</option><option value="office">Office</option><option value="other">Other</option></select></div></div>
    {Object.values(errors).some(Boolean) && <p className="address-error" role="alert">Check the highlighted address fields.</p>}
    <p className="address-form-note">Saved in this browsing session until you place an order. The selected delivery details are then saved with your demo order.</p>
    <div className="address-form-actions"><button className="shop-button" type="button" onClick={onCancel}>Cancel</button><button className="shop-button shop-button-solid" type="submit">{initial ? 'Save changes' : 'Save address'}</button></div>
  </form>
}
