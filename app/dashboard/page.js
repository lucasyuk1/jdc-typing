"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Chart from "chart.js/auto";

export default function DashboardPage() {
const [user, setUser] = useState(null);
const [resultados, setResultados] = useState([]);
const [mediaWPM, setMediaWPM] = useState(null);

const wpmChartRef = useRef(null);
const accuracyChartRef = useRef(null);
const wpmChartInstance = useRef(null);
const accuracyChartInstance = useRef(null);

useEffect(() => {
const u = localStorage.getItem("jdc-user");
if (!u) window.location.href = "/auth";
else setUser(JSON.parse(u));
}, []);

useEffect(() => {
if (!user) return;

async function loadResultados() {
  const res = await fetch("/api/results/ranking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "pessoal",
      username: user.username,
      turma: user.turma
    })
  });

  const data = await res.json();
  if (data.success) {
    setResultados(data.data);
    if (data.data.length > 0) {
      const soma = data.data.reduce((acc, r) => acc + r.wpm, 0);
      setMediaWPM(Math.round(soma / data.data.length));
    }
  }
}

loadResultados();

}, [user]);

useEffect(() => {
if (resultados.length === 0) return;

const labels = resultados.map((r) =>
  new Date(r.created_at).toLocaleDateString("pt-BR")
).reverse();

const wpmData = resultados.map((r) => r.wpm).reverse();
const accuracyData = resultados.map((r) => r.accuracy).reverse();

if (wpmChartInstance.current) wpmChartInstance.current.destroy();
if (accuracyChartInstance.current) accuracyChartInstance.current.destroy();

wpmChartInstance.current = new Chart(wpmChartRef.current, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "WPM",
      data: wpmData,
      borderWidth: 3,
      tension: 0.4,
      borderColor: "#4a90e2",
      backgroundColor: "rgba(74,144,226,0.2)",
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: "#4a90e2"
    }]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { color: "#fff" } } } }
});

accuracyChartInstance.current = new Chart(accuracyChartRef.current, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Acurácia (%)",
      data: accuracyData,
      borderWidth: 3,
      tension: 0.4,
      borderColor: "#34d399",
      backgroundColor: "rgba(52,211,153,0.2)",
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: "#34d399"
    }]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 }, x: { ticks: { color: "#fff" } } } }
});

}, [resultados]);

const handleLogout = () => {
localStorage.removeItem("jdc-user");
window.location.href = "/auth";
};

if (!user) return <p>Carregando...</p>;

return (
<div style={{ padding: 40, fontFamily: "Arial, sans-serif", color: "#fff", minHeight: "100vh", background: "#0A0F1F" }}>
{/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
<div style={{ display: "flex", alignItems: "center", gap: 15 }}>
<div style={{ width: 60, height: 60, background: "#111827", borderRadius: "12px" }}></div>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<h1 style={{ fontSize: 36, marginBottom: 5 }}>Olá, {user.username}!</h1> <Image src="/images/mascote.png" width={50} height={50} alt="Mascote" /> </div>
<p style={{ color: "#ccc" }}>Turma: <b>{user.turma}</b> | Idade: <b>{user.idade}</b></p> </div> <nav> <a href="/test" style={linkStyle}>Fazer teste</a> <a href="/ranking" style={linkStyle}>Ranking</a>
<button onClick={handleLogout} style={{ ...linkStyle, background: "transparent", border: "none", cursor: "pointer" }}>Sair</button> </nav> </div>

  {/* Média de WPM */}
  <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <Image src="/images/mascote.png" width={100} height={100} alt="Mascote" style={{ animation: "bounce 1.2s infinite" }} />
    <h2 style={{ fontSize: 22, marginBottom: 5 }}>Sua média de WPM</h2>
    <p style={{ fontSize: 48, fontWeight: "bold", color: "#4a90e2", margin: 0, textAlign: "center" }}>
      {mediaWPM !== null ? mediaWPM : "—"}
    </p>
  </div>

  {/* Últimos resultados */}
  <div style={{ marginTop: 50 }}>
    <h2 style={{ fontSize: 26, marginBottom: 20 }}>Seus últimos resultados</h2>
    {resultados.length === 0 ? <p>Nenhum resultado encontrado.</p> :
      <div style={{ display: "grid", gap: 10 }}>
        {resultados.map((r) => (
          <div key={r.id} style={resultItemStyle}>
            <b>WPM:</b> {r.wpm} — <b>Precisão:</b> {r.accuracy}% — <b>Tempo:</b> {r.tempo_segundos}s
            <br />
            <small style={{ color: "#999" }}>{new Date(r.created_at).toLocaleString("pt-BR")}</small>
          </div>
        ))}
      </div>}
  </div>

  {/* Gráficos */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 40 }}>
    <div style={cardStyle}>
      <h3 style={graphTitleStyle}>Evolução do WPM</h3>
      <canvas ref={wpmChartRef} />
    </div>
    <div style={cardStyle}>
      <h3 style={graphTitleStyle}>Evolução da Precisão (%)</h3>
      <canvas ref={accuracyChartRef} />
    </div>
  </div>

  <style>{`
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  `}</style>
</div>

);
}

const cardStyle = { background: "#1f2937", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
const resultItemStyle = { background: "#111827", padding: 15, borderRadius: 8, fontSize: 18, color: "#fff" };
const linkStyle = { color: "#4a90e2", marginLeft: 20, textDecoration: "none", fontWeight: "bold" };
const graphTitleStyle = { fontSize: 18, marginBottom: 10 };
