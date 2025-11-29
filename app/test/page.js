"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("jdc-user");
    if (!u) return (window.location.href = "/auth");
    setUser(JSON.parse(u));

    loadNewText();
  }, []);

  function loadNewText() {
    const texts = [
      "A computação é uma ferramenta essencial no mundo moderno...",
      "Os alunos devem sempre praticar digitação para melhorar...",
      "Aprender lógica e tecnologia abre portas para o futuro...",
    ];
    setText(texts[Math.floor(Math.random() * texts.length)]);
  }

  useEffect(() => {
    if (finished) return;

    const i = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(i);
  }, [finished]);

  function finishTest() {
    setFinished(true);

    const words = typed.trim().split(/\s+/).length;
    const wpm = Math.round(words / 3);

    saveResult(wpm);
  }

  async function saveResult(wpm) {
    await fetch("/api/results/save", {
      method: "POST",
      body: JSON.stringify({
        wpm,
        username: user.username,
        turma: user.turma
      }),
    });
  }

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Teste de Digitação – 3 minutos</h1>

      <p><b>Tempo restante:</b> {timeLeft}s</p>

      <div style={{ marginTop: 20 }}>
        <p style={{ background: "#eee", padding: 10 }}>{text}</p>
      </div>

      {!finished ? (
        <>
          <textarea
            style={{ width: "100%", height: 150, marginTop: 10 }}
            placeholder="Digite aqui..."
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <button onClick={loadNewText}>Gerar novo texto</button>
        </>
      ) : (
        <p style={{ marginTop: 20, fontSize: 20, color: "green" }}>
          Teste finalizado! Vá ao ranking para ver seu resultado.
        </p>
      )}
    </div>
  );
}
