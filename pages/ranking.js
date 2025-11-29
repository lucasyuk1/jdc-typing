
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Ranking() {
  const [rows, setRows] = useState([])

  useEffect(()=> {
    async function load() {
      const { data } = await supabase.from('results').select('*, profiles!user_id(nome,turma)').order('wpm', { ascending: false }).limit(50)
      setRows(data || [])
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Ranking</h1>
        <div className="bg-card rounded p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-300">
                <th>Aluno</th><th>Turma</th><th>WPM</th><th>Precisão</th><th>Data</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="py-2">{r.profiles?.nome || 'Anônimo'}</td>
                  <td>{r.profiles?.turma || '-'}</td>
                  <td>{r.wpm}</td>
                  <td>{r.precisao}%</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
