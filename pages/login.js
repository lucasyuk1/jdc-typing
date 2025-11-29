
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      router.push('/test')
    }
  }

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-md mx-auto p-6">
        <div className="bg-card p-6 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Entrar</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input className="w-full p-3 rounded bg-white/5" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input type="password" className="w-full p-3 rounded bg-white/5" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="w-full p-3 bg-neon-blue rounded">Entrar</button>
          </form>
        </div>
      </main>
    </div>
  )
}
