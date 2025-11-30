"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Mascote from "../images/mascote.png";

export default function RankingPage() {
const [user, setUser] = useState(null);
const [mode, setMode] = useState("geral");
const [ranking, setRanking] = useState([]);

// Carrega usuário do localStorage
useEffect(() => {
const u = localStorage.getItem("jdc-user");
if (!u) return (window.location.href = "/auth");
setUser(JSON.parse(u));
}, []);

// Recarrega ranking sempre que o modo ou usuário mudam
useEffect(() => {
if (!user) return;
loadRanking();
}, [mode, user]);

async function loadRanking() {
try {
const res = await fetch("/api/results/ranking", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
mode,
fullname: user?.fullname,
turma: user?.turma
}),
});

  const json = await res.json();
  if (!json.success) {
    setRanking([]);
    return;
  }

  setRanking(json.data);

} catch (err) {
  console.error("Erro ao carregar ranking:", err);
  setRanking([]);
}

}

if (!user) return <p>Carregando...</p>;

return (
<div style={{ padding: 40, fontFamily: "Arial, sans-serif", color: "#fff", minHeight: "100vh", background: "#0A0F1F" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
<h1 style={{ fontSize: 36 }}>Ranking</h1>
<div style={{ display: "flex", alignItems: "center", gap: 15 }}> <Image src={Mascote} width={50} height={50} alt="Mascote" />
<button onClick={() => window.location.href = "/dashboard"} style={backButtonStyle}>Voltar</button> </div> </div>

  <div style={{ marginBottom: 20 }}>
    <button onClick={() => setMode("geral")} style={{ ...modeButtonStyle, background: mode === "geral" ? "#1E90FF" : "#4a90e2" }}>Geral</button>
    <button onClick={() => setMode("turma")} style={{ ...modeButtonStyle, background: mode === "turma" ? "#1E90FF" : "#4a90e2" }}>Sua Turma ({user.turma})</button>
    <button onClick={() => setMode("pessoal")} style={{ ...modeButtonStyle, background: mode === "pessoal" ? "#1E90FF" : "#4a90e2" }}>Seus Resultados</button>
  </div>

  {ranking.length === 0 ? (
    <p style={{ textAlign: "center", marginTop: 40, fontSize: 18 }}>
      {mode === "pessoal" ? "Você ainda não possui resultados." : "Nenhum resultado encontrado para este modo."}
    </p>
  ) : (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#1f2937", textAlign: "center" }}>
          <th style={thTdStyle}>#</th>
          <th style={thTdStyle}>Nome</th>
          <th style={thTdStyle}>Turma</th>
          <th style={thTdStyle}>{mode === "pessoal" ? "WPM" : "WPM Médio"}</th>
          <th style={thTdStyle}>{mode === "pessoal" ? "Precisão" : "Precisão Média"}</th>
          <th style={thTdStyle}>Data</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map((r, i) => (
          <tr key={r.usuario_id + i} style={{
            textAlign: "center",
            borderBottom: "1px solid #333",
            background: r.usuario_id === user.usuario_id ? "linear-gradient(90deg, rgba(30,144,255,0.3), rgba(30,144,255,0.1))" : "transparent",
            fontWeight: r.usuario_id === user.usuario_id ? "bold" : "normal"
          }}>
            <td style={thTdStyle}>{i + 1}</td>
            <td style={thTdStyle}>{r.fullname}</td>
            <td style={thTdStyle}>{r.turma}</td>
            <td style={thTdStyle}>{r.wpm}</td>
            <td style={thTdStyle}>{r.accuracy ?? "-"}</td>
            <td style={thTdStyle}>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

);
}

const thTdStyle = { padding: "10px", fontSize: 16, textAlign: "center" };
const backButtonStyle = {
marginLeft: 10,
padding: "8px 15px",
borderRadius: 8,
border: "none",
cursor: "pointer",
background: "#4a90e2",
color: "#fff",
fontWeight: "bold",
boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
transition: "all 0.3s",
};
const modeButtonStyle = {
marginRight: 10,
padding: "8px 15px",
borderRadius: 8,
border: "none",
cursor: "pointer",
color: "#fff",
fontWeight: "bold",
transition: "all 0.3s",
};
