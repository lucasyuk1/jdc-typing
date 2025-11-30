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
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#0A0F1F", color: "#fff" }}>
      {/* Header com mascote */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src="styles/images/mascote.png" alt="Mascote" style={{ width: 80, height: 80 }} />
          <h1 style={{ fontSize: 36 }}>Ranking - Olá, {user.username}!</h1>
        </div>
        <div>
          <button style={buttonStyle(mode === "geral")} onClick={() => setMode("geral")}>Geral</button>
          <button style={buttonStyle(mode === "turma")} onClick={() => setMode("turma")}>Sua Turma ({user.turma})</button>
          <button style={buttonStyle(mode === "pessoal")} onClick={() => setMode("pessoal")}>Seus Resultados</button>
        </div>
      </div>

      {/* Tabela de ranking */}
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#1f2937" }}>
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
              <tr key={r.usuario_id} style={{ background: i % 2 === 0 ? "#111827" : "#1f2937" }}>
                <td>{i + 1}</td>
                <td>{r.username}</td>
                <td>{r.turma}</td>
                <td style={{ color: getWPMColor(r.wpm) }}>{r.wpm}</td>
                <td>{r.accuracy ?? "-"}</td>
                <td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Estilos
const buttonStyle = (active) => ({
  background: active ? "#4a90e2" : "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  marginRight: 10,
  cursor: "pointer",
  fontWeight: "bold"
});

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 18
};

const getWPMColor = (wpm) => {
  if (wpm < 30) return "#F44336";
  if (wpm < 60) return "#FFC107";
  return "#4CAF50";
};
