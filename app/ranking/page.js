"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

uniqueRanking.sort((a, b) => b.wpm - a.wpm);

setRanking(uniqueRanking);

}

if (!user) return <p>Carregando...</p>;

return (
<div style={{ padding: 40, fontFamily: "Arial, sans-serif", color: "#fff", minHeight: "100vh", background: "#0A0F1F" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
<h1 style={{ fontSize: 36 }}>Ranking</h1> <div> <Image src="/images/mascote.png" width={50} height={50} alt="Mascote" />
<button onClick={() => window.location.href = "/dashboard"} style={linkStyle}>Voltar</button> </div> </div>

  <div style={{ marginBottom: 20 }}>
    <button onClick={() => setMode("geral")} style={buttonStyle}>Geral</button>
    <button onClick={() => setMode("turma")} style={buttonStyle}>Sua Turma ({user.turma})</button>
    <button onClick={() => setMode("pessoal")} style={buttonStyle}>Seus Resultados</button>
  </div>

  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#1f2937", textAlign: "center" }}>
        <th style={thTdStyle}>#</th>
        <th style={thTdStyle}>Usuário</th>
        <th style={thTdStyle}>Turma</th>
        <th style={thTdStyle}>WPM Médio</th>
        <th style={thTdStyle}>Precisão Média</th>
        <th style={thTdStyle}>Último Teste</th>
      </tr>
    </thead>
    <tbody>
      {ranking.map((r, i) => (
        <tr key={r.usuario_id} style={{ textAlign: "center", borderBottom: "1px solid #333" }}>
          <td style={thTdStyle}>{i + 1}</td>
          <td style={thTdStyle}>{r.username}</td>
          <td style={thTdStyle}>{r.turma}</td>
          <td style={thTdStyle}>{r.wpm}</td>
          <td style={thTdStyle}>{r.accuracy ?? "-"}</td>
          <td style={thTdStyle}>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

);
}

const thTdStyle = { padding: "10px", fontSize: 16 };
const linkStyle = { color: "#4a90e2", marginLeft: 20, textDecoration: "none", fontWeight: "bold", background: "transparent", border: "none", cursor: "pointer" };
const buttonStyle = { marginRight: 10, padding: "8px 15px", borderRadius: 8, border: "none", cursor: "pointer", background: "#4a90e2", color: "#fff", fontWeight: "bold" };
