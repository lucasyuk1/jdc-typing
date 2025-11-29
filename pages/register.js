
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [turma, setTurma] = useState('')
  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
      return
    }
    // After signUp, create profile row
    const user = data.user
    await supabase.from('profiles').insert([{ id: user.id, nome, idade: Number(idade), turma, is_admin: false }])
    alert('Cadastro criado. Verifique seu email para confirmar (se aplicável).')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-md mx-auto p-6">
        <div className="bg-card p-6 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
          <form onSubmit={handleRegister} className="space-y-3">
            <input className="w-full p-3 rounded bg-white/5" placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
            <input className="w-full p-3 rounded bg-white/5" placeholder="Idade" value={idade} onChange={e=>setIdade(e.target.value)} />
            <input className="w-full p-3 rounded bg-white/5" placeholder="Turma" value={turma} onChange={e=>setTurma(e.target.value)} />
            <input className="w-full p-3 rounded bg-white/5" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input type="password" className="w-full p-3 rounded bg-white/5" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="w-full p-3 bg-neon-purple rounded">Cadastrar</button>
          </form>
        </div>
      </main>
    </div>
  )
}
