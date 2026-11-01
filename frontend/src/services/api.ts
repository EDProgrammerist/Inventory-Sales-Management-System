import {getCsrfToken,getSession} from './auth'

const base=import.meta.env.VITE_API_BASE_URL?.replace(/\/$/,'')
export async function apiRequest(path:string,method='GET',body?:unknown,signal?:AbortSignal,retry=true) {
  if(!base)throw new Error('The data service is unavailable. Please check the API configuration.')
  const headers:Record<string,string>={}
  if(method!=='GET'){headers['Content-Type']='application/json';headers['x-csrf-token']=await getCsrfToken()}
  let response:Response
  try {
    response=await fetch(`${base}${path}`,{method,headers,credentials:'include',...(body===undefined?{}:{body:JSON.stringify(body)}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000)})
  } catch(error) {
    if(signal?.aborted)throw error
    throw new Error('Unable to reach the data service. Your changes have not been confirmed saved. Please try again.',{cause:error})
  }
  if(response.status===401&&retry&&await getSession())return apiRequest(path,method,body,signal,false)
  const result=await response.json()
  if(!response.ok)throw new Error(response.status===401?'Please sign in before continuing.':result.message??'Unable to save your changes. Please try again.')
  return result.data
}
