
import Header from '../components/Header'
import TestArea from '../components/TestArea'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Test() {
  const [result, setResult] = useState(null)

  async function handleFinish(res) {
    setResult(res)
    // Save to supabase (user must be logged in)
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    const userId = user ? user.id : null
    await supabase.from('results').insert([{ user_id: userId, wpm: res.wpm, precisao: res.accuracy, erros: res.errors, palavras_digitadas: res.wordsTyped }])
  }

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Teste de Digitação</h1>
        <TestArea onFinish={handleFinish} />
        {result && (
          <div className="mt-6 bg-card p-4 rounded">
            <h2 className="font-semibold">Resultado</h2>
            <p>WPM: {result.wpm}</p>
            <p>Precisão: {result.accuracy}%</p>
            <p>Palavras digitadas: {result.wordsTyped}</p>
            <p>Erros: {result.errors}</p>
          </div>
        )}
      </main>
    </div>
  )
}
