"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Mascote from "../images/mascote.png";
import { useRouter } from "next/navigation";

export default function RankingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("geral");
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("jdc-user");
    if (!stored) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    carregarRanking();
  }, [mode, user]);

  async function carregarRanking() {
    setLoading(true);
    try {
      const resp = await fetch("/api/results/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          usuario_id: user.usuario_id,
          turma: user.turma,
        }),
      });

      const json = await resp.json();
      setRanking(json.success ? json.data : []);
    } catch (err) {
      console.error("Erro:", err);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <p className="text-white p-6">Carregando...</p>;

  // 🔥 REMOVE "larbak" DO RANKING GERAL E TURMA
  const rankingFiltrado =
    mode === "pessoal"
      ? ranking
      : ranking.filter((r) => r.username !== "larbak");

  const meusResultados = ranking.filter(
    (r) => r.username === "larbak"
  );

  const getRowClass = (r) =>
    r.username === "larbak"
      ? "bg-blue-800/70 font-semibold"
      : "bg-white/5";

  const getRankingDisplay = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10">
        <h1 className="text-4xl font-bold text-purple-400 mb-2">Ranking</h1>
        <div className="flex items-center gap-4">
          <Image src={Mascote} width={50} height={50} alt="Mascote" className="animate-float"/>
          <button className="btn-auth px-4 py-2" onClick={() => router.push("/dashboard")}>
            Voltar
          </button>
        </div>
      </header>

      {/* 🔵 RESULTADOS DO LARBAK */}
      {meusResultados.length > 0 && (
        <div className="mb-8 bg-blue-900/40 border border-blue-500 rounded-xl p-4">
          <h2 className="text-xl font-bold text-blue-300 mb-3">
            📌 Desafio do Prof. Lucas
          </h2>

          {meusResultados.map((r, i) => (
            <div
              key={`larbak-${i}`}
              className="flex justify-between bg-blue-800/40 px-4 py-2 rounded mb-2"
            >
              <span>{r.wpm} WPM</span>
              <span>{r.accuracy}%</span>
              <span>{new Date(r.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      )}

      {/* MODO */}
      <div className="flex gap-4 mb-6">
        <button
          className={`mode-btn ${mode === "geral" ? "active" : ""}`}
          onClick={() => setMode("geral")}
        >
          Geral
        </button>

        <button
          className={`mode-btn ${mode === "turma" ? "active" : ""}`}
          onClick={() => setMode("turma")}
        >
          Turma ({user.turma})
        </button>

        <button
          className={`mode-btn ${mode === "pessoal" ? "active" : ""}`}
          onClick={() => setMode("pessoal")}
        >
          Seus Resultados
        </button>
      </div>

      {loading && <p className="text-center text-lg">Carregando ranking...</p>}

      {!loading && rankingFiltrado.length === 0 && (
        <p className="text-center text-lg">
          Nenhum resultado encontrado.
        </p>
      )}

      {!loading && rankingFiltrado.length > 0 && (
        <div className="overflow-x-auto relative z-10">
          <table className="w-full border-collapse text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800/70">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Turma</th>
                <th className="px-3 py-2">
                  {mode === "pessoal" ? "WPM" : "WPM Médio"}
                </th>
                <th className="px-3 py-2">
                  {mode === "pessoal" ? "Precisão" : "Precisão Média"}
                </th>
                <th className="px-3 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {rankingFiltrado.map((r, i) => (
                <tr
                  key={r.id ?? `${r.usuario_id}-${i}`}
                  className={`${getRowClass(r)} border-b border-gray-700`}
                >
                  <td className="px-3 py-2">{getRankingDisplay(i)}</td>
                  <td className="px-3 py-2">{r.fullname ?? r.username}</td>
                  <td className="px-3 py-2">{r.turma}</td>
                  <td className="px-3 py-2">{r.wpm}</td>
                  <td className="px-3 py-2">
                    {r.accuracy !== null && r.accuracy !== undefined
                      ? `${r.accuracy}%`
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .mode-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          border: 1px solid #60a5fa;
          color: #93c5fd;
          transition: all 0.2s;
        }
        .mode-btn:hover {
          background: rgba(59,130,246,0.2);
        }
        .mode-btn.active {
          background-color: #4a90e2;
          color: white;
        }
        .btn-auth {
          background-color: #4a90e2;
          color: white;
          font-weight: 600;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
