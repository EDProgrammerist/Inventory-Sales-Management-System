import { type CatalogProduct } from './storefront-catalog'

export type SpecKind = 'display' | 'chip' | 'memory' | 'camera' | 'power' | 'storage'
export interface ProductDetails {
  highlights: { label: string; value: string; kind: SpecKind }[]
  groups: { title: string; rows: [string, string][] }[]
  source: string
  sourceName: string
  note?: string
}

// Manufacturer facts, not store availability or promises. Sources are linked in the UI.
export function getProductDetails(product: CatalogProduct): ProductDetails {
  const documented:Record<string,[string,string]>={'iphone-purple':['iPhone 14 Pro Max','phones'],'iphone-gold':['iPhone 14 Pro','phones'],'iphone-silver':['iPhone 14 Pro','phones'],'iphone-black':['iPhone 14 Pro','phones'],'rtx-5090':['GeForce RTX 5090','computers'],'rtx-5080':['GeForce RTX 5080','computers'],'ps5-disc':['PlayStation 5','consoles'],'ps5-digital':['PlayStation 5','consoles']}
  if (documented[product.id]?.[0]!==product.name||documented[product.id]?.[1]!==product.category) return {
    highlights:[],groups:[{title:'Product information',rows:[['Product',product.name],['Configuration',product.variant],['Category',product.category==='phones'?'iPhone':product.category==='computers'?'Graphics card':'PlayStation 5']]}],source:'',sourceName:'',note:'Specifications for this manually entered configuration have not been supplied. Confirm the exact model before ordering.',
  }
  if (product.category === 'phones') {
    const max = product.id === 'iphone-purple'
    const screen = max ? '6.7 inches' : '6.1 inches'
    const resolution = max ? '2796 × 1290' : '2556 × 1179'
    const storage = product.variant.split(' · ')[0]
    return {
      highlights: [
        { label: 'Screen size', value: screen, kind: 'display' },
        { label: 'Chip', value: 'A16 Bionic', kind: 'chip' },
        { label: 'Storage', value: storage, kind: 'storage' },
        { label: 'Main camera', value: '48MP', kind: 'camera' },
        { label: 'Front camera', value: '12MP', kind: 'camera' },
        { label: 'Refresh rate', value: 'Up to 120Hz', kind: 'display' },
      ],
      groups: [
        { title: 'Screen', rows: [['Screen diagonal', screen], ['Resolution', `${resolution} pixels`], ['Display type', 'Super Retina XDR OLED'], ['Refresh rate', 'Adaptive, up to 120Hz']] },
        { title: 'Processor', rows: [['Chip', 'A16 Bionic'], ['CPU', '6 cores'], ['GPU', '5 cores']] },
        { title: 'Camera & storage', rows: [['Main camera', '48MP'], ['Ultra Wide', '12MP'], ['Front camera', '12MP TrueDepth'], ['Listed capacity', storage], ['Finish', product.variant.split(' · ')[1]]] },
      ],
      source: `https://support.apple.com/en-us/${max ? '111846' : '111849'}`,
      sourceName: 'Apple technical specifications',
    }
  }
  if (product.category === 'computers') {
    const flagship = product.id === 'rtx-5090'
    const memory = flagship ? '32GB GDDR7' : '16GB GDDR7'
    const cores = flagship ? '21,760' : '10,752'
    const power = flagship ? '575W' : '360W'
    return {
      highlights: [
        { label: 'Video memory', value: memory, kind: 'memory' },
        { label: 'Architecture', value: 'Blackwell', kind: 'chip' },
        { label: 'CUDA cores', value: cores, kind: 'chip' },
        { label: 'Memory bus', value: flagship ? '512-bit' : '256-bit', kind: 'memory' },
        { label: 'Graphics power', value: power, kind: 'power' },
        { label: 'Interface', value: 'PCIe Gen 5', kind: 'storage' },
      ],
      groups: [
        { title: 'Graphics processor', rows: [['Architecture', 'NVIDIA Blackwell'], ['CUDA cores', cores], ['Boost clock', flagship ? '2.41 GHz' : '2.62 GHz']] },
        { title: 'Memory', rows: [['Video memory', memory], ['Memory interface', flagship ? '512-bit' : '256-bit']] },
        { title: 'Founders Edition requirements', rows: [['Graphics power', power], ['Required system power', flagship ? '1000W' : '850W'], ['Length', '304 mm'], ['Width', '137 mm'], ['Slots', '2']] },
      ],
      source: `https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/${product.id}/`,
      sourceName: 'NVIDIA specifications',
      note: 'Check your case, power supply, and full system configuration. Requirements vary by build and card manufacturer.',
    }
  }
  return {
    highlights: [
      { label: 'Processor', value: 'AMD Zen 2', kind: 'chip' },
      { label: 'CPU cores', value: '8 cores', kind: 'chip' },
      { label: 'Graphics', value: 'AMD RDNA 2', kind: 'display' },
      { label: 'System memory', value: '16GB GDDR6', kind: 'memory' },
      { label: 'Storage type', value: 'Custom SSD', kind: 'storage' },
      { label: 'Disc drive', value: product.id === 'ps5-disc' ? 'Ultra HD Blu-ray' : 'Not included', kind: 'storage' },
    ],
    groups: [
      { title: 'Console hardware', rows: [['CPU', '8-core AMD Zen 2'], ['GPU', 'Custom AMD RDNA 2'], ['System memory', '16GB GDDR6']] },
      { title: 'Listed edition', rows: [['Edition', product.variant.split(' · ')[0]], ['Finish', 'White'], ['Disc drive', product.id === 'ps5-disc' ? 'Ultra HD Blu-ray' : 'Not included']] },
      { title: 'Before choosing', rows: [['Storage capacity', 'Confirm the exact console model'], ['Product image', 'Edition-specific console and packaging photos'], ['Games & accessories', 'Confirm what is included before ordering']] },
    ],
    source: 'https://blog.playstation.com/2020/03/18/unveiling-new-details-of-playstation-5-hardware-technical-specs/',
    sourceName: 'PlayStation hardware specifications',
    note: 'The catalog does not specify a console model number. Storage capacity and included accessories must be confirmed for the exact model.',
  }
}

export function relatedProducts(product: CatalogProduct, products: CatalogProduct[]) {
  return products.filter(item => item.id !== product.id).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 4)
}
