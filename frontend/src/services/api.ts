import {getCsrfToken,getSession} from './auth'

const base=import.meta.env.VITE_API_BASE_URL?.replace(/\/$/,'')
export async function apiRequest<T=Record<string,unknown>>(path:string,method='GET',body?:unknown,signal?:AbortSignal,retry=true):Promise<T> {
  if(!base)throw new Error('The data service is unavailable. Please check the API configuration.')
  signal?.throwIfAborted()
  const headers:Record<string,string>={}
  if(method!=='GET'){headers['Content-Type']='application/json';headers['x-csrf-token']=await getCsrfToken()}
  let response:Response
  try {
    response=await fetch(`${base}${path}`,{method,headers,credentials:'include',...(body===undefined?{}:{body:JSON.stringify(body)}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000)})
  } catch(error) {
    if(signal?.aborted)throw error
    throw new Error('Unable to reach the data service. Your changes have not been confirmed saved. Please try again.',{cause:error})
  }
  if(response.status===401&&retry&&await getSession())return apiRequest<T>(path,method,body,signal,false)
  if(response.status===401)throw new Error('Please sign in before continuing.')
  const fallback=method==='GET'?'Unable to load your data. Please try again.':'Your changes have not been confirmed saved. Please try again.'
  let result:unknown
  try{result=await response.json()}catch{throw new Error(response.ok?'The data service returned an invalid response. Please try again.':fallback)}
  const record=result!==null&&typeof result==='object'&&!Array.isArray(result)?result as Record<string,unknown>:undefined
  if(!response.ok)throw new Error(typeof record?.message==='string'&&record.message.trim()?record.message:fallback)
  if(!record||!Object.hasOwn(record,'data'))throw new Error('The data service returned an invalid response. Please try again.')
  return record.data as T
}
