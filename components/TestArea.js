
import { useEffect, useRef, useState } from 'react'

export default function TestArea({ duration = 180, onFinish }) {
  // duration in seconds (3 minutes -> 180)
  const [text, setText] = useState('')
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    // For starter: a small pool of texts
    const pool = [
      "A programação ensina lógica e persistência.",
      "Pratique todos os dias para melhorar a velocidade.",
      "A digitação rápida ajuda na produtividade em sala de aula."
    ]
    setText(pool[Math.floor(Math.random()*pool.length)])
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            handleFinish()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function start() {
    setRunning(true)
  }

  function handleFinish() {
    // compute WPM and accuracy
    const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length
    const minutes = duration / 60
    const wpm = Math.round(wordsTyped / minutes)
    const errors = computeErrors(text, input)
    const accuracy = Math.max(0, Math.round((1 - (errors / Math.max(1, wordsTyped))) * 100))
    if (onFinish) onFinish({ wpm, accuracy, wordsTyped, errors })
  }

  function computeErrors(target, typed) {
    // naive: compare chars
    let errs = 0
    const minl = Math.min(target.length, typed.length)
    for (let i=0;i<minl;i++){
      if (target[i] !== typed[i]) errs++
    }
    errs += Math.abs(target.length - typed.length)
    return errs
  }

  return (
    <div className="bg-card p-6 rounded-2xl text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-300">Tempo restante: <span className="font-mono">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</span></div>
        <div>
          {!running ? <button onClick={start} className="px-3 py-1 bg-neon-purple rounded">Iniciar</button> : <span className="px-3 py-1 bg-white/5 rounded">Executando</span>}
        </div>
      </div>
      <div className="mb-4">
        <div className="p-4 rounded bg-white/5 min-h-[120px]">{text}</div>
      </div>
      <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full min-h-[120px] p-3 rounded bg-white/5" placeholder="Comece a digitar aqui..."></textarea>
    </div>
  )
}
