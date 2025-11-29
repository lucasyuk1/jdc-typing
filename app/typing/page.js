"use client";
import { useEffect, useRef, useState } from "react";

const TEXTS = [
  "A programação ensina lógica e persistência. Pratique todos os dias.",
  "A digitação rápida ajuda na produtividade em sala de aula e nos estudos.",
  "Escreva frases e trechos curtos para melhorar a velocidade e precisão."
];

export default function TypingPage() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  function start() {
    setInput("");
    setTimeLeft(180);
    setRunning(true);
  }

  function computeErrors(target, typed) {
    let errs = 0;
    const minl = Math.min(target.length, typed.length);
    for (let i = 0; i < minl; i++) {
      if (target[i] !== typed[i]) errs++;
    }
    errs += Math.abs(target.length - typed.length);
    return errs;
  }

  async function finish() {
    const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
    const minutes = 3;
    const wpm = Math.round(wordsTyped / minutes);
    const errors = computeErrors(text, input);
    const accuracy = Math.max(0, Math.round((1 - errors / Math.max(1, wordsTyped)) * 100));
    const payload = { wpm, accuracy, errors, wordsTyped, tempo: 180 };

    setResult(payload);

    // save to backend
    const user = JSON.parse(localStorage.getItem("jdc_user") || "null");
    await fetch("/api/results", {
      method: "POST",
      body: JSON.stringify({
        user_id: user?.id || null,
        wpm,
        accuracy,
        errors,
        wordsTyped,
        tempo: 180
      })
    });
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Teste de Digitação (3 minutos)</h1>
      <div style={{ marginTop: 12 }}>
        <div>Tempo: {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}</div>
        <div style={{ background: "#081026", padding: 12, borderRadius: 8, marginTop: 8 }}>{text}</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} style={{ width: "100%", minHeight: 160, marginTop: 8 }} />
        <div style={{ marginTop: 8 }}>
          {!running ? <button onClick={start}>Iniciar</button> : <button disabled>Executando...</button>}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 12, background: "#031226", padding: 10, borderRadius: 6 }}>
          <div>WPM: {result.wpm}</div>
          <div>Accuracy: {result.accuracy}%</div>
          <div>Erros: {result.errors}</div>
        </div>
      )}
    </main>
  );
}
