"use client";

import { useEffect, useState } from "react";

export default function RankingPage() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("geral");
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem("jdc-user");
    if (!u) return (window.location.href = "/auth");
    setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadRanking();
  }, [mode, user]);

  async function loadRanking() {
    const res = await fetch("/api/results/ranking", {
      method: "POST",
      body: JSON.stringify({
        mode,
        username: user.username,
        turma: user.turma,
      }),
    });

    const json = await res.json();
    if (json.success) {
      setRanking(json.data);
    }
  }

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Ranking</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("geral")}>
          Geral
        </button>
        <button onClick={() => setMode("turma")}>
          Sua Turma ({user.turma})
        </button>
        <button onClick={() => setMode("pessoal")}>
          Seus Resultados
        </button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuário</th>
            <th>Turma</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.username}</td>
              <td>{r.turma}</td>
              <td>{r.wpm}</td>
              <td>{r.accuracy ?? "-"}</td>
              <td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
