import {Link,Navigate,Outlet,useLocation} from 'react-router'
import {useAuth} from './use-auth'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function CustomerRoute({requireSignIn=false}:{requireSignIn?:boolean}){
 const {user,signedOut,loading,error,retry}=useAuth(),location=useLocation()
 if(loading)return <main className="flex min-h-[60dvh] items-center justify-center gap-3" role="status"><LoadingSpinner/>Checking your account…</main>
 if(error)return <main className="shop-container cart-empty"><p role="alert">{error}</p><button className="shop-button" onClick={retry}>Try again</button><Link className="shop-text-link" to="/login">Sign in</Link></main>
 if(!user)return signedOut&&!requireSignIn?<Navigate to="/" replace/>:<Navigate to="/login" replace state={{from:location.pathname+location.search}}/>
 return <Outlet/>
}
