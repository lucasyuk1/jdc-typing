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
  setRanking(json.success ? json.data : []);
} catch (err) {
  console.error("Erro:", err);
  setRanking([]);
} finally {
  setLoading(false);
}

}

if (!user) return <p className="text-center mt-10">Carregando...</p>;

const getRowClass = (r) => r.usuario_id === user.id ? "bg-blue-800" : "";

const getRankingDisplay = (index) => {
if (index === 0) return "🥇";
if (index === 1) return "🥈";
if (index === 2) return "🥉";
return index + 1;
};

return ( <div className="ranking-container p-8 text-white min-h-screen bg-gray-900">

  {/* Cabeçalho */}
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-bold">Ranking</h1>
    <div className="flex items-center gap-4">
      <Image src={Mascote} width={50} height={50} alt="Mascote" />
      <button className="btn" onClick={() => router.push("/dashboard")}>Voltar</button>
    </div>
  </div>

  {/* Modo */}
  <div className="flex gap-4 mb-6">
    <button className={`mode-btn ${mode === "geral" ? "active" : ""}`} onClick={() => setMode("geral")}>Geral</button>
    <button className={`mode-btn ${mode === "turma" ? "active" : ""}`} onClick={() => setMode("turma")}>Turma ({user.turma})</button>
    <button className={`mode-btn ${mode === "pessoal" ? "active" : ""}`} onClick={() => setMode("pessoal")}>Seus Resultados</button>
  </div>

  {/* Loading */}
  {loading && <p className="text-center text-lg">Carregando ranking...</p>}

  {/* Sem dados */}
  {!loading && ranking.length === 0 && (
    <p className="text-center text-lg">
      {mode === "pessoal"
        ? "Você ainda não possui resultados."
        : "Nenhum resultado encontrado."}
    </p>
  )}

  {/* Tabela */}
  {!loading && ranking.length > 0 && (
    <div className="overflow-x-auto">
      <table className="ranking-table w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">Turma</th>
            <th className="px-3 py-2">{mode === "pessoal" ? "WPM" : "WPM Médio"}</th>
            <th className="px-3 py-2">{mode === "pessoal" ? "Precisão" : "Precisão Média"}</th>
            <th className="px-3 py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr
              key={r.id ?? `${r.usuario_id}-${i}`}
              className={getRowClass(r)}
            >
              <td className="px-3 py-2">{getRankingDisplay(i)}</td>
              <td className="px-3 py-2">{r.fullname ?? "Sem nome"}</td>
              <td className="px-3 py-2">{r.turma}</td>
              <td className="px-3 py-2">{r.wpm}</td>
              <td className="px-3 py-2">{r.accuracy ?? "-"}</td>
              <td className="px-3 py-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

);
}
