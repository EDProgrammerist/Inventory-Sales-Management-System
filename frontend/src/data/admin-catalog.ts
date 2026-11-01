import {decodeCatalog,type CatalogProduct} from './storefront-catalog'

export interface AdminCatalogProduct extends CatalogProduct {
  imageKey:string
  customImage?:string
  stockQuantity:number|null
  threshold:number
  published:boolean
  version:number
}
export type AdminProductInput=Omit<AdminCatalogProduct,'image'|'customImage'|'version'>&{image?:string|null;expectedVersion?:number}
export const electronicsCategories=[{id:'phones',name:'Phones (iPhone)'},{id:'computers',name:'Computers (GPU)'},{id:'consoles',name:'Consoles (PS5)'}] as const
export const productImages=['iphone-purple','iphone-gold','iphone-silver','iphone-black','rtx-5090','rtx-5080','ps5']

export function decodeAdminCatalog(data:unknown):AdminCatalogProduct[] {
  const products=decodeCatalog(data)
  const rows=(data as {products:Record<string,unknown>[]}).products
  return products.map((product,index)=>{
    const row=rows[index]
    if(typeof row.published!=='boolean'||(row.stockQuantity!==null&&(!Number.isSafeInteger(row.stockQuantity)||Number(row.stockQuantity)<0||Number(row.stockQuantity)>1000000))||!Number.isSafeInteger(row.threshold)||Number(row.threshold)<0||Number(row.threshold)>1000000)throw new Error('Invalid catalog management response. Please reload.')
    if(!Number.isSafeInteger(row.version)||Number(row.version)<0)throw new Error('Invalid product version. Please reload.')
    return {...product,imageKey:String(row.imageKey),customImage:typeof row.image==='string'?row.image:undefined,published:row.published,stockQuantity:row.stockQuantity as number|null,threshold:Number(row.threshold),version:Number(row.version)}
  })
}
