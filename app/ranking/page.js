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
if (!json.success) return;

let data = json.data;

// Agrupar por usuário e calcular médias
const grouped = {};
data.forEach(r => {
  if (!grouped[r.usuario_id]) {
    grouped[r.usuario_id] = {
      usuario_id: r.usuario_id,
      username: r.username,
      turma: r.turma,
      totalWPM: r.wpm,
      totalAcc: r.accuracy ?? 0,
      count: 1,
      lastDate: r.created_at
    };
  } else {
    grouped[r.usuario_id].totalWPM += r.wpm;
    grouped[r.usuario_id].totalAcc += r.accuracy ?? 0;
    grouped[r.usuario_id].count += 1;
    if (new Date(r.created_at) > new Date(grouped[r.usuario_id].lastDate)) {
      grouped[r.usuario_id].lastDate = r.created_at;
    }
  }
});

const uniqueRanking = Object.values(grouped).map(u => ({
  usuario_id: u.usuario_id,
  username: u.username,
  turma: u.turma,
  wpm: Math.round(u.totalWPM / u.count),
  accuracy: Math.round(u.totalAcc / u.count),
  created_at: u.lastDate
}));

// Ordena pelo WPM médio decrescente
uniqueRanking.sort((a, b) => b.wpm - a.wpm);

setRanking(uniqueRanking);

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
