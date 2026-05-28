import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 공개 페이지는 supabase 를 호출하지 않으므로, env 누락이어도 페이지가
  // 죽지는 않도록 stub client 를 export. admin 기능을 쓰려면 .env.local
  // (dev) 또는 hosting 환경변수 (prod) 에 VITE_SUPABASE_URL +
  // VITE_SUPABASE_ANON_KEY 등록 필요.
  console.warn(
    '[supabase] env 누락 — admin 기능 비활성화. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 설정 필요.',
  )
}

const stubError = new Error('Supabase env 미설정')

function stubClient() {
  const fail = async () => ({ data: null, error: stubError })
  const chain = new Proxy(function chainFn() {}, {
    get: () => chain,
    apply: () => Promise.resolve({ data: null, error: stubError }),
  })
  return {
    auth: {
      getSession: fail,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: fail,
      signOut: fail,
    },
    from: () => chain,
    rpc: fail,
    storage: { from: () => ({ upload: fail, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  }
}

export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : stubClient()

export const supabaseEnabled = !!(url && anonKey)
