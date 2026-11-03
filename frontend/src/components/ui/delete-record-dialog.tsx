import {useState} from 'react'
import DashboardDialog from './dashboard-dialog'

export default function DeleteRecordDialog({name,description,onDelete,onClose}:{name:string;description:string;onDelete:()=>Promise<void>;onClose:()=>void}) {
  const [saving,setSaving]=useState(false),[error,setError]=useState('')
  async function remove(){if(saving)return;setSaving(true);setError('');try{await onDelete();onClose()}catch(reason){setError(reason instanceof Error?reason.message:'Unable to delete this record. Please try again.');setSaving(false)}}
  return <DashboardDialog title={`Delete ${name}?`} busy={saving} onClose={()=>{if(!saving)onClose()}}>
    <p className="text-sm leading-6 text-muted">{description}</p>
    {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <p role="status" className="mt-3 text-sm text-muted">{saving?'Deleting…':''}</p>
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      <button data-dialog-autofocus className="inventory-button" disabled={saving} onClick={onClose}>Keep record</button>
      <button className="inventory-button border-red-700 bg-red-700 text-white hover:bg-red-800" disabled={saving} aria-busy={saving} onClick={()=>void remove()}>{saving?'Deleting…':'Delete record'}</button>
    </div>
  </DashboardDialog>
}
