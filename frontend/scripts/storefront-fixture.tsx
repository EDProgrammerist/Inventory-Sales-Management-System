import type { ReactNode } from 'react'
import { storefrontProducts } from './storefront-fixture-data'
import { StorefrontContext } from '../src/components/context/storefront-context'
import { emptyAddressState } from '../src/components/context/storefront-address-state'
import { initialShipping } from '../src/data/storefront-checkout'
import {AuthContext,type AuthState} from '../src/components/context/auth-state'

// Approved import dataset is an explicit isolated fixture, never a runtime fallback.
const noop=()=>{}
const anonymous:AuthState={user:null,loading:false,error:'',retry:noop,login:async()=>{throw new Error('SSR cannot authenticate')},signup:async()=>{throw new Error('SSR cannot authenticate')},logout:async()=>{}}
export default function StorefrontFixture({children,bag={}}:{children:ReactNode;bag?:Record<string,number>}) {
  return <AuthContext value={anonymous}><StorefrontContext value={{products:storefrontProducts,catalogLoading:false,catalogError:null,reloadCatalog:noop,completeOrder:noop,bag,saved:[],notice:'',toggleSaved:noop,addToBag:noop,setQuantity:noop,addressState:emptyAddressState,saveAddress:noop,removeAddress:noop,selectAddress:noop,shipping:initialShipping,setShipping:noop}}>{children}</StorefrontContext></AuthContext>
}
