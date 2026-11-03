import {useCommerce} from '@/components/context/commerce-context'

export default function CommerceRefresh({label}:{label:string}) {
  const {refresh,refreshing,refreshMessage,refreshError}=useCommerce()
  return <div className="flex flex-wrap items-center gap-3">
    <button className="inventory-button" onClick={refresh} disabled={refreshing} aria-busy={refreshing}>{refreshing?'Refreshing…':label}</button>
    <p role="status" className="max-w-sm text-sm text-muted">{refreshMessage}</p>
    {refreshError&&<p role="alert" className="max-w-sm text-sm text-red-700">{refreshError} Showing last loaded data. Use {label.toLowerCase()} to try again.</p>}
  </div>
}
