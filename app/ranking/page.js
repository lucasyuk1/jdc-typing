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
body: JSON.stringify({ mode, usuario_id: user.id, turma: user.turma }),
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

const getRowClass = (r) =>
r.usuario_id === user.id ? "bg-blue-800/70 font-semibold" : "bg-white/5";

const getRankingDisplay = (index) => {
if (index === 0) return "🥇";
if (index === 1) return "🥈";
if (index === 2) return "🥉";
return index + 1;
};

return ( <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">

  {/* HEADER */}
  <header className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10">
    <h1 className="text-4xl font-bold text-purple-400 mb-2">Ranking</h1>
    <div className="flex items-center gap-4">
      <Image src={Mascote} width={50} height={50} alt="Mascote" className="animate-float"/>
      <button className="btn-auth px-4 py-2" onClick={() => router.push("/dashboard")}>Voltar</button>
    </div>
  </header>

  {/* MODO */}
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
      {mode === "pessoal" ? "Você ainda não possui resultados." : "Nenhum resultado encontrado."}
    </p>
  )}

  {/* Tabela */}
  {!loading && ranking.length > 0 && (
    <div className="overflow-x-auto relative z-10">
      <table className="w-full border-collapse text-left rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800/70">
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
            <tr key={r.id ?? `${r.usuario_id}-${i}`} className={`${getRowClass(r)} border-b border-gray-700`}>
              <td className="px-3 py-2">{getRankingDisplay(i)}</td>
              <td className="px-3 py-2">{r.fullname ?? "Sem nome"}</td>
              <td className="px-3 py-2">{r.turma}</td>
              <td className="px-3 py-2">{r.wpm}</td>
              <td className="px-3 py-2">{r.accuracy !== null && r.accuracy !== undefined ? `${r.accuracy}%` : "-"}</td>
              <td className="px-3 py-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {/* Mascote flutuante */}
  <div className="absolute -bottom-10 -right-10 w-32 h-32 animate-float z-0">
    <Image src={Mascote} alt="Mascote" width={128} height={128} />
  </div>

  <style jsx>{`
    @keyframes float {
      0%,100%{transform: translateY(0);}
      50%{transform: translateY(-12px) rotate(-5deg);}
    }
    .animate-float{animation: float 3s ease-in-out infinite;}
    .mode-btn {
      px-4 py-2 rounded-lg font-semibold border border-blue-400 text-blue-300 hover:bg-blue-500/20 transition-all
    }
    .mode-btn.active {
      background-color: #4a90e2;
      color: white;
      box-shadow: 0 4px 12px rgba(74,144,226,0.4);
    }
    .btn-auth {
      background-color: #4a90e2;
      color: white;
      font-semibold;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }
    .btn-auth:hover { background-color: #357ABD; }
  `}</style>
</div>

);
}
