
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Admin() {
  const [rows, setRows] = useState([])

  useEffect(()=> {
    async function load() {
      const { data } = await supabase.from('results').select('*').order('created_at', { ascending: false }).limit(200)
      setRows(data || [])
    }
    load()
  }, [])

  async function handleDelete(id) {
    if (!confirm('Apagar resultado?')) return
    await supabase.from('results').delete().eq('id', id)
    setRows(r => r.filter(x => x.id !== id))
  }

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <div className="bg-card rounded p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-300">
                <th>Usuário</th><th>WPM</th><th>Precisão</th><th>Data</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="py-2">{r.user_id}</td>
                  <td>{r.wpm}</td>
                  <td>{r.precisao}%</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td><button className="px-2 py-1 bg-red-600 rounded" onClick={()=>handleDelete(r.id)}>Apagar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
