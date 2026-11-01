import {useState,type FormEvent} from 'react'
import {electronicsCategories,productImages,type AdminCatalogProduct,type AdminProductInput} from '@/data/admin-catalog'
import ImageUpload from '@/components/ui/image-upload'

export default function CatalogProductForm({product,onSave,onCancel}:{product?:AdminCatalogProduct;onSave:(input:AdminProductInput)=>Promise<void>;onCancel:()=>void}) {
  const [image,setImage]=useState<string|undefined>(product?.customImage)
  const [reading,setReading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('')
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(saving||reading)return
    const data=new FormData(event.currentTarget),text=(key:string)=>String(data.get(key)??'').trim()
    const stock=text('stockQuantity')
    const input:AdminProductInput={id:text('id'),name:text('name'),variant:text('variant'),category:text('category') as AdminProductInput['category'],price:Number(text('price')),description:text('description'),imageKey:text('imageKey'),image:image??null,featured:data.has('featured'),published:data.has('published'),stockQuantity:stock===''?null:Number(stock),threshold:Number(text('threshold')),...(product?{expectedVersion:product.version}:{})}
    setSaving(true);setError('')
    try{await onSave(input)}catch(reason){setError(reason instanceof Error?reason.message:'Unable to save this product.');setSaving(false)}
  }
  return <form className="commerce-form" onSubmit={submit} aria-busy={saving}>
    <p className="commerce-note">Published products appear in the store. Enter actual stock when known; electronics do not need an expiry date.</p>
    <ImageUpload image={image} onChange={setImage} onBusyChange={setReading}/>
    <fieldset disabled={saving} className="commerce-fields">
      <legend className="sr-only">Product details</legend>
      <label>Product ID<input name="id" defaultValue={product?.id} required readOnly={Boolean(product)} pattern="[a-z0-9-]{1,80}" maxLength={80} placeholder="e.g. iphone-model-finish"/></label>
      <label>Product name<input name="name" defaultValue={product?.name} required maxLength={150}/></label>
      <label>Configuration / variant<input name="variant" defaultValue={product?.variant} required maxLength={150} placeholder="Storage, model and finish"/></label>
      <label>Category<select name="category" defaultValue={product?.category??'phones'}>{electronicsCategories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Selling price (PHP)<input name="price" type="number" min="0.01" max="9999999999.99" step="0.01" defaultValue={product?.price} required/></label>
      <label>Stock quantity<input name="stockQuantity" type="number" min="0" max="1000000" step="1" defaultValue={product?.stockQuantity??''} aria-describedby="catalog-stock-help"/></label>
      <label>Low-stock threshold<input name="threshold" type="number" min="0" max="1000000" step="1" defaultValue={product?.threshold??0} required/></label>
      <label>Fallback product image<select name="imageKey" defaultValue={product?.imageKey??'iphone-black'}>{productImages.map(key=><option key={key} value={key}>{key}</option>)}</select></label>
      <p id="catalog-stock-help" className="commerce-note wide">Blank stock means Not set. Zero means out of stock. The fallback image is used only when no product photo is uploaded.</p>
      <label className="wide">Description<textarea name="description" defaultValue={product?.description} maxLength={2000} required/></label>
    </fieldset>
    <div className="commerce-checks"><label><input type="checkbox" name="published" defaultChecked={product?.published??true} disabled={saving}/>Published in store</label><label><input type="checkbox" name="featured" defaultChecked={product?.featured??false} disabled={saving}/>Featured product</label></div>
    {error&&<p className="commerce-error" role="alert">{error}</p>}
    <div className="commerce-actions"><button type="button" className="inventory-button" disabled={saving} onClick={onCancel}>Cancel</button><button className="inventory-button commerce-primary" disabled={saving||reading}>{saving?'Saving…':product?'Save product':'Add product'}</button></div>
  </form>
}
