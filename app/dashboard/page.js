"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [mediaWPM, setMediaWPM] = useState(null);

  // Referências dos gráficos
  const wpmChartRef = useRef(null);
  const accuracyChartRef = useRef(null);
  const wpmChartInstance = useRef(null);
  const accuracyChartInstance = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("jdc-user");
    if (!u) {
      window.location.href = "/auth";
    } else {
      setUser(JSON.parse(u));
    }
  }, []);

  // Buscar resultados quando o usuário existir
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

  // Criar gráficos quando resultados mudarem
  useEffect(() => {
    if (resultados.length === 0) return;

    const labels = resultados
      .map((r) => new Date(r.created_at).toLocaleDateString("pt-BR"))
      .reverse();

    const wpmData = resultados.map((r) => r.wpm).reverse();
    const accuracyData = resultados.map((r) => r.accuracy).reverse();

    // Destroi gráficos antigos antes de recriar
    if (wpmChartInstance.current) wpmChartInstance.current.destroy();
    if (accuracyChartInstance.current) accuracyChartInstance.current.destroy();

    // Gráfico WPM
    wpmChartInstance.current = new Chart(wpmChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "WPM",
            data: wpmData,
            borderWidth: 3,
            tension: 0.3
          }
        ]
      }
    });

    // Gráfico Acurácia
    accuracyChartInstance.current = new Chart(accuracyChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Acurácia (%)",
            data: accuracyData,
            borderWidth: 3,
            tension: 0.3
          }
        ]
      }
    });
  }, [resultados]);

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 32 }}>Olá, {user.username}!</h1>
      <p>Turma: <b>{user.turma}</b></p>
      <p>Idade: <b>{user.idade}</b></p>

      <nav style={{ marginTop: 20, marginBottom: 30 }}>
        <a href="/test" style={{ marginRight: 20 }}>Fazer teste de digitação</a>
        <a href="/ranking">Ver ranking</a>
      </nav>

      {/* MÉDIA DESTACADA */}
      <div
        style={{
          background: "#4a90e2",
          padding: 20,
          color: "white",
          borderRadius: 10,
          marginBottom: 30,
          width: "fit-content",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)"
        }}
      >
        <h2 style={{ margin: 0, fontSize: 26 }}>Sua média de WPM</h2>
        <p style={{ margin: 0, fontSize: 40, fontWeight: "bold", textAlign: "center" }}>
          {mediaWPM !== null ? mediaWPM : "—"}
        </p>
      </div>

      {/* GRÁFICO DE WPM */}
      <h2 style={{ fontSize: 26 }}>Evolução do WPM</h2>
      <canvas ref={wpmChartRef} style={{ maxWidth: "700px", marginBottom: 50 }} />

      {/* GRÁFICO DE ACURÁCIA */}
      <h2 style={{ fontSize: 26 }}>Evolução da Acurácia (%)</h2>
      <canvas ref={accuracyChartRef} style={{ maxWidth: "700px", marginBottom: 50 }} />

      {/* ÚLTIMOS RESULTADOS */}
      <h2 style={{ fontSize: 26 }}>Seus últimos resultados</h2>

      {resultados.length === 0 ? (
        <p>Nenhum resultado encontrado.</p>
      ) : (
        <ul style={{ marginTop: 10, paddingLeft: 20 }}>
          {resultados.map((r) => (
            <li key={r.id} style={{ marginBottom: 8, fontSize: 18 }}>
              <b>WPM:</b> {r.wpm} — <b>Precisão:</b> {r.accuracy}% — <b>Tempo:</b> {r.tempo_segundos}s
              <br />
              <small style={{ color: "#666" }}>
                {new Date(r.created_at).toLocaleString("pt-BR")}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
