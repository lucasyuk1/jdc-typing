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
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
mode,
username: user.username,
turma: user.turma,
}),
});

const json = await res.json();
if (json.success) {
  let data = json.data;

  // Para modo "pessoal", calcula média no frontend
  if (mode === "pessoal") {
    const userResults = data.filter(r => r.usuario_id === user.id);
    if (userResults.length > 0) {
      const wpmAvg = Math.round(userResults.reduce((acc, r) => acc + r.wpm, 0) / userResults.length);
      const accAvg = Math.round(userResults.reduce((acc, r) => acc + (r.accuracy ?? 0), 0) / userResults.length);
      data = [{
        usuario_id: user.id,
        username: user.username,
        turma: user.turma,
        wpm: wpmAvg,
        accuracy: accAvg,
        created_at: userResults[userResults.length - 1].created_at
      }];
    }
  }

  setRanking(data);
}

}

if (!user) return <p>Carregando...</p>;

return (
<div style={{ padding: 40 }}> <h1>Ranking</h1>

  <div style={{ marginBottom: 20 }}>
    <button onClick={() => setMode("geral")}>Geral</button>
    <button onClick={() => setMode("turma")}>Sua Turma ({user.turma})</button>
    <button onClick={() => setMode("pessoal")}>Seus Resultados</button>
  </div>

  <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead>
      <tr style={{ background: "#eee" }}>
        <th>#</th>
        <th>Usuário</th>
        <th>Turma</th>
        <th>WPM Médio</th>
        <th>Precisão Média</th>
        <th>Último Teste</th>
      </tr>
    </thead>

    <tbody>
      {ranking.map((r, i) => (
        <tr key={r.usuario_id}>
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
