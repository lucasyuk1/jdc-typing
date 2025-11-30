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

  // Carrega usuário
  useEffect(() => {
    const stored = localStorage.getItem("jdc-user");
    if (!stored) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  // Recarrega ranking
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
          usuario_id: user.id,
          turma: user.turma,
        }),
      });

      const json = await resp.json();
      setRanking(json.data || []);
    } catch (err) {
      console.error("Erro:", err);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="ranking-container">

      {/* Cabeçalho */}
      <div className="ranking-header">
        <h1 className="ranking-title">Ranking</h1>

        <div className="ranking-header-side">
          <Image src={Mascote} width={50} height={50} alt="Mascote" />
          <button className="btn" onClick={() => router.push("/dashboard")}>
            Voltar
          </button>
        </div>
      </div>

      {/* Modo */}
      <div className="ranking-modes">
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

      {/* Loading */}
      {loading && (
        <p className="text-center mt-10 text-lg">Carregando ranking...</p>
      )}

      {/* Sem dados */}
      {!loading && ranking.length === 0 && (
        <p className="text-center mt-10 text-lg">
          {mode === "pessoal"
            ? "Você ainda não possui resultados."
            : "Nenhum resultado encontrado."}
        </p>
      )}

      {/* Tabela */}
      {!loading && ranking.length > 0 && (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Turma</th>
              <th>{mode === "pessoal" ? "WPM" : "WPM Médio"}</th>
              <th>{mode === "pessoal" ? "Precisão" : "Precisão Média"}</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((r, i) => (
              <tr
                key={r.id ?? `${r.usuario_id}-${i}`}
                className={r.usuario_id === user.id ? "highlight-row" : ""}
              >
                <td>{i + 1}</td>
                <td>{r.fullname ?? "Sem nome"}</td>
                <td>{r.turma}</td>
                <td>{r.wpm}</td>
                <td>{r.accuracy ?? "-"}</td>
                <td>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
