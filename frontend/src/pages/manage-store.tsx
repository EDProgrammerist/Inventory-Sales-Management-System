import { useState } from 'react'
import CommerceLayout from '@/components/common/commerce-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import DeleteRecordDialog from '@/components/ui/delete-record-dialog'
import RecordForm, { type RecordField } from '@/components/ui/record-form'
import { selectStores, validateStore, type Store } from '@/data/stores-demo'
import { useWorkspace } from '@/components/context/workspace-context'

const fields: RecordField[] = [
  { name: 'branch', label: 'Branch Name' },
  { name: 'name', label: 'Store Name' },
  { name: 'address', label: 'Street Address' },
  { name: 'city', label: 'City and Postal Code' },
  { name: 'phone', label: 'Contact Number', type: 'tel', maxLength: 32 },
]
export default function ManageStorePage() {
  const { stores, saveStore, deleteStore } = useWorkspace()
  const [deleting,setDeleting]=useState<Store|null>(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Store | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const [notice, setNotice] = useState('')
  const rows = selectStores(stores, query)
  function close() {
    setFormOpen(false)
    setEditing(null)
  }
  return (
    <CommerceLayout
      title="Manage Store"
      query={query}
      onQueryChange={setQuery}
      compact={compact}
      onCompactChange={setCompact}
      searchPlaceholder="Search stores or branches"
      searchLabel="Search branches, store names, addresses, or phone numbers"
    >
      {notice && (
        <p role="status" className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      <section
        aria-labelledby="manage-store-heading"
        className="rounded-[10px] bg-white pb-8"
      >
        <header className="flex items-center justify-between gap-4 p-5">
          <h2 id="manage-store-heading" className="dashboard-heading">
            Manage Store
          </h2>
          <button
            className="inventory-button border-[#1765d5] bg-[#1765d5] text-white hover:bg-blue-700"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add Store
          </button>
        </header>
        <div className={`grid px-5 pt-2 sm:px-10 ${compact ? 'gap-5' : 'gap-10'}`}>
          {rows.map((store) => (
            <article
              key={store.id}
              aria-label={store.branch}
              className="grid overflow-hidden rounded-md border border-[#edf0f3] md:grid-cols-[30%_1fr]"
            >
              <div
                className={`grid place-items-center bg-[#f0f1f3] px-5 text-center ${compact ? 'py-6' : 'py-8 md:py-12'}`}
              >
                <h3 className="text-base font-semibold text-[#505966]">{store.branch}</h3>
              </div>
              <div className="relative min-w-0 p-5 pr-5 sm:pr-28">
                <h4 className="text-base font-medium text-[#657084]">{store.name}</h4>
                <address className="mt-2 space-y-3 text-sm leading-6 text-muted not-italic [overflow-wrap:anywhere]">
                  <p>{store.address}</p>
                  <p>{store.city}</p>
                  <p>{store.phone}</p>
                </address>
                <button
                  aria-label={`Edit ${store.branch}`}
                  className="inventory-button mt-4 border-blue-50 px-6 text-blue-600 sm:absolute sm:top-4 sm:right-4 sm:mt-0"
                  onClick={() => {
                    setEditing(store)
                    setFormOpen(true)
                  }}
                >
                  Edit
                </button>
                <button className="dashboard-link mt-4 block text-red-700" aria-label={`Delete ${store.branch}`} onClick={()=>setDeleting(store)}>Delete store</button>
              </div>
            </article>
          ))}
          {!rows.length && (
            <div className="py-24 text-center">
              <h3 className="font-medium">{stores.length?'No matching stores':'No stores yet'}</h3>
              {!stores.length&&<p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">Add a store to keep its branch address and contact details together.</p>}
              <button className="dashboard-link mt-3" onClick={() => {if(stores.length)setQuery('');else{setEditing(null);setFormOpen(true)}}}>
                {stores.length?'Clear search':'Add store'}
              </button>
            </div>
          )}
        </div>
      </section>
      {deleting&&<DeleteRecordDialog name={deleting.branch} description="This permanently removes this store's branch and contact details from your list. Saved orders are unchanged." onClose={()=>setDeleting(null)} onDelete={async()=>{await deleteStore(deleting.id);setNotice(`${deleting.branch} was deleted.`)}}/>}
      {formOpen && (
        <DashboardDialog title={editing ? 'Edit Store' : 'New Store'} onClose={close}>
          <RecordForm
            fields={fields}
            initial={editing ? { ...editing } : undefined}
            validate={(input) => validateStore(input, stores, editing?.id)}
            onCancel={close}
            submitLabel={editing ? 'Save Changes' : 'Add Store'}
            onSave={async (input) => {
              const next: Store = {
                id: editing?.id ?? crypto.randomUUID(),
                branch: input.branch.trim(),
                name: input.name.trim(),
                address: input.address.trim(),
                city: input.city.trim(),
                phone: input.phone.trim(),
              }
              await saveStore(next, Boolean(editing))
              setQuery('')
              setNotice(
                `${next.branch} ${editing ? 'updated' : 'added'} in the store list.`,
              )
              close()
            }}
          />
        </DashboardDialog>
      )}
    </CommerceLayout>
  )
}
