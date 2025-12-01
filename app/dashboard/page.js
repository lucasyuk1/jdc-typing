"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Chart from "chart.js/auto";
import Mascote from "../images/mascote.png";

export default function DashboardPage() {
const [user, setUser] = useState(null);
const [resultados, setResultados] = useState([]);
const [mediaWPM, setMediaWPM] = useState(null);

const wpmChartRef = useRef(null);
const accuracyChartRef = useRef(null);
const wpmChartInstance = useRef(null);
const accuracyChartInstance = useRef(null);

// Verifica login
useEffect(() => {
const u = localStorage.getItem("jdc-user");
if (!u) window.location.href = "/auth";
else setUser(JSON.parse(u));
}, []);

// Carrega dados do ranking pessoal
useEffect(() => {
if (!user) return;

async function loadResultados() {
  const res = await fetch("/api/results/ranking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "pessoal",
      usuario_id: user.id,
      turma: user.turma
    })
  });

  const data = await res.json();
  if (data.success) {
    setResultados(data.data);
    // Calcula a média de WPM a partir do array de resultados
    if (data.data.length > 0) {
      const soma = data.data.reduce((acc, r) => acc + r.wpm, 0);
      setMediaWPM(Math.round(soma / data.data.length));
    } else {
      setMediaWPM(0);
    }
  }
}

loadResultados();

}, [user]);

// Configura os gráficos
useEffect(() => {
if (resultados.length === 0) return;

const labels = resultados
  .map((r) => new Date(r.created_at).toLocaleDateString("pt-BR"))
  .reverse();

const wpmData = resultados.map((r) => r.wpm).reverse();
const accuracyData = resultados.map((r) => r.accuracy).reverse();

if (wpmChartInstance.current) wpmChartInstance.current.destroy();
if (accuracyChartInstance.current) accuracyChartInstance.current.destroy();

wpmChartInstance.current = new Chart(wpmChartRef.current, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "WPM",
        data: wpmData,
        borderWidth: 3,
        tension: 0.4,
        borderColor: "#4a90e2",
        backgroundColor: "rgba(74,144,226,0.2)",
        fill: true,
        pointRadius: 5
      }
    ]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

accuracyChartInstance.current = new Chart(accuracyChartRef.current, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Acurácia (%)",
        data: accuracyData,
        borderWidth: 3,
        tension: 0.4,
        borderColor: "#34d399",
        backgroundColor: "rgba(52,211,153,0.2)",
        fill: true,
        pointRadius: 5
      }
    ]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  }
});

}, [resultados]);

const handleLogout = () => {
localStorage.removeItem("jdc-user");
window.location.href = "/auth";
};

if (!user) return <p className="text-white p-6">Carregando...</p>;

return ( <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">

  {/* HEADER */}
  <header className="flex justify-between items-center mb-10">
    <div>
      <h1 className="text-4xl font-bold">Olá, {user.username}!</h1>
      <p className="text-gray-400 mt-1">
        Turma: <span className="font-semibold text-blue-300">{user.turma}</span> • Idade: <b>{user.idade}</b>
      </p>
    </div>

    <div className="flex items-center gap-4">
      <Image src={Mascote} alt="Mascote" width={60} height={60} />

      <nav className="flex gap-4">
        <a href="/test" className="link-nav">Fazer Teste</a>
        <a href="/ranking" className="link-nav">Ranking</a>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </nav>
    </div>
  </header>

  {/* MÉDIA WPM */}
  <div className="card flex flex-col items-center gap-3 mb-12">
    <Image
      src={Mascote}
      width={110}
      height={110}
      alt="Mascote"
      className="animate-bounce"
    />
    <h2 className="text-xl text-gray-200">Sua média de WPM</h2>
    <p className="text-6xl font-extrabold text-blue-400">
      {mediaWPM ?? "—"}
    </p>
  </div>

  {/* ÚLTIMOS RESULTADOS */}
  <section className="mb-12">
    <h2 className="text-3xl font-semibold mb-4">Seus resultados recentes</h2>

    {resultados.length === 0 ? (
      <p>Nenhum resultado encontrado.</p>
    ) : (
      <div className="grid gap-3">
        {resultados.map((r) => (
          <div key={r.id} className="card py-3 px-4">
            <p className="text-lg">
              <b>WPM:</b> {r.wpm} — <b>Precisão:</b> {r.accuracy}%
            </p>
            <p className="text-gray-400 text-sm">
              {new Date(r.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>

  {/* GRÁFICOS */}
  <div className="grid md:grid-cols-2 gap-10">
    <div className="card">
      <h3 className="text-xl mb-3">Evolução do WPM</h3>
      <canvas ref={wpmChartRef} />
    </div>

    <div className="card">
      <h3 className="text-xl mb-3">Evolução da Precisão (%)</h3>
      <canvas ref={accuracyChartRef} />
    </div>
  </div>
</div>

);
}
