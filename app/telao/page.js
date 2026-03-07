"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function Telao() {

  const [ranking, setRanking] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [lider, setLider] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const top3Anterior = useRef([]);

  async function carregarDados() {

    const { data } = await supabase
      .from("results")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const filtrado = data.filter(r =>
      r.username !== "larbak" &&
      r.turma &&
      !r.turma.toLowerCase().includes("prof")
    );

    const mapa = {};

    filtrado.forEach(r => {
      if (!mapa[r.username] || r.wpm > mapa[r.username].wpm) {
        mapa[r.username] = r;
      }
    });

    const rankingCompleto = Object.values(mapa)
      .sort((a, b) => b.wpm - a.wpm);

    const top = rankingCompleto.slice(0, 10);

    const ultimosComPosicao = filtrado.slice(0, 8).map(r => {

      const pos = rankingCompleto.findIndex(
        p => p.username === r.username
      );

      return {
        ...r,
        posicao: pos >= 0 ? pos + 1 : "-"
      };

    });

    const top3Atual = top.slice(0, 3).map(r => r.username);

    const novoTop3 = top3Atual.find(
      u => !top3Anterior.current.includes(u)
    );

    if (novoTop3) {

      const aluno = top.find(r => r.username === novoTop3);

      setAlerta({
        nome: aluno.fullname || aluno.username,
        turma: aluno.turma,
        pos: top3Atual.indexOf(novoTop3) + 1
      });

      setTimeout(() => setAlerta(null), 5000);
    }

    top3Anterior.current = top3Atual;

    setRanking(top);
    setUltimos(ultimosComPosicao);
    setLider(top[0]);

  }

  useEffect(() => {

    carregarDados();

    const interval = setInterval(() => {
      carregarDados();
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  function medalha(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  }

  return (

    <div style={{
      background: "#0f172a",
      color: "white",
      minHeight: "100vh",
      width: "100vw",
      padding: "40px",
      boxSizing: "border-box",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>

      <style>{`

        .grid-main{
          display:grid;
          grid-template-columns:1fr 1.4fr;
          gap:40px;
          width:100%;
        }

        .rank-item{
          transition:all .5s ease;
        }

        .rank-item:hover{
          transform:scale(1.02);
        }

        .top3{
          animation:pulse 2s infinite;
        }

        @keyframes pulse{
          0%{box-shadow:0 0 0 gold}
          50%{box-shadow:0 0 20px gold}
          100%{box-shadow:0 0 0 gold}
        }

        .nome{
          font-weight:700;
        }

        .turma{
          font-size:18px;
          opacity:.7;
          margin-left:8px;
        }

        .posicao{
          background:#334155;
          padding:4px 10px;
          border-radius:8px;
          font-size:18px;
          margin-right:10px;
        }

        .alerta{
          position:fixed;
          top:0;
          left:0;
          width:100%;
          height:100%;
          background:rgba(0,0,0,0.85);
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          z-index:9999;
        }

        .alerta h1{
          font-size:80px;
          color:gold;
        }

        .alerta h2{
          font-size:70px;
          font-weight:800;
        }

        .alerta p{
          font-size:40px;
        }

      `}</style>

      {alerta && (

        <div className="alerta">

          <h1>🔥 NOVO TOP 3</h1>

          <h2>{alerta.nome}</h2>

          <p>
            entrou em {alerta.pos}º lugar • {alerta.turma}
          </p>

        </div>

      )}

      <div className="grid-main">

        {/* COLUNA ESQUERDA */}

        <div>

          {lider && (

            <div style={{
              padding: "25px",
              marginBottom: "30px",
              background: "#1e293b",
              borderRadius: "16px",
              border: "3px solid gold",
              textAlign: "center"
            }}>

              <div style={{
                fontSize: "28px",
                opacity: 0.8
              }}>
                🏆 Líder do Ranking
              </div>

              <div style={{
                fontSize: "60px",
                fontWeight: "800"
              }}>
                {lider.fullname || lider.username}
              </div>

              <div style={{
                fontSize: "36px",
                color: "#22c55e"
              }}>
                {lider.wpm} WPM • {lider.accuracy}%
              </div>

            </div>

          )}

          <h2 style={{
            fontSize: "36px",
            marginBottom: "16px"
          }}>
            ⏱ Últimos Resultados
          </h2>

          {ultimos.map((r, i) => (

            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px",
              background: "#1e293b",
              marginBottom: "10px",
              borderRadius: "10px",
              fontSize: "24px"
            }}>

              <div>

                <span className="posicao">
                  #{r.posicao}
                </span>

                <span className="nome">
                  {r.fullname || r.username}
                </span>

              </div>

              <span style={{ fontWeight: "bold" }}>
                {r.wpm} WPM • {r.accuracy}%
              </span>

            </div>

          ))}

        </div>

        {/* COLUNA DIREITA */}

        <div>

          <h2 style={{
            fontSize: "42px",
            marginBottom: "20px"
          }}>
            🏆 Top 10
          </h2>

          {ranking.map((r, i) => (

            <div
              key={r.username}
              className={`rank-item ${i < 3 ? "top3" : ""}`}
              style={{
                padding: "18px",
                marginBottom: "12px",
                borderRadius: "14px",
                fontSize: "28px",
                background:
                  i === 0 ? "#78350f" :
                  i === 1 ? "#334155" :
                  i === 2 ? "#92400e" :
                  "#1e293b"
              }}
            >

              <div style={{
                display: "flex",
                justifyContent: "space-between"
              }}>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px"
                }}>

                  <span style={{ fontSize: "32px" }}>
                    {medalha(i)}
                  </span>

                  <span className="nome">
                    {r.fullname || r.username}
                  </span>

                  <span className="turma">
                    ({r.turma})
                  </span>

                </div>

                <div style={{ fontWeight: "bold" }}>
                  {r.wpm} WPM • {r.accuracy}%
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}
