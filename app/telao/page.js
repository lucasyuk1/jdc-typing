"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Telao() {

  const [ranking, setRanking] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [lider, setLider] = useState(null);

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

    setUltimos(filtrado.slice(0, 12));

    const mapa = {};

    filtrado.forEach(r => {
      if (!mapa[r.username] || r.wpm > mapa[r.username].wpm) {
        mapa[r.username] = r;
      }
    });

    const top = Object.values(mapa)
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10);

    setRanking(top);
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

  function barraWPM(wpm) {
    const max = 120;
    return Math.min((wpm / max) * 100, 100);
  }

  return (

    <div style={{
      background: "#0f172a",
      color: "white",
      minHeight: "100vh",
      width: "100vw",
      padding: "40px",
      boxSizing: "border-box",
      fontFamily: "sans-serif"
    }}>

      <style>{`

        .grid-main{
          display:grid;
          grid-template-columns: 1fr 1.4fr;
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

        .bar-bg{
          background:#1e293b;
          height:10px;
          border-radius:6px;
          overflow:hidden;
          margin-top:8px;
        }

        .bar-fill{
          background:#22c55e;
          height:100%;
          transition:width .6s ease;
        }

      `}</style>

      {/* LIDER */}

      {lider && (

        <div style={{
          width: "100%",
          padding: "30px",
          marginBottom: "40px",
          background: "#1e293b",
          borderRadius: "16px",
          border: "3px solid gold",
          textAlign: "center"
        }}>

          <div style={{
            fontSize: "32px",
            opacity: 0.8
          }}>
            🏆 LÍDER DO RANKING
          </div>

          <div style={{
            fontSize: "72px",
            fontWeight: "bold",
            marginTop: "10px"
          }}>
            {lider.fullname || lider.username}
          </div>

          <div style={{
            fontSize: "44px",
            color: "#22c55e"
          }}>
            {lider.wpm} WPM • {lider.accuracy}%
          </div>

        </div>

      )}

      <div className="grid-main">

        {/* ULTIMOS */}

        <div style={{ width: "100%" }}>

          <h2 style={{
            fontSize: "38px",
            marginBottom: "20px"
          }}>
            ⏱ Últimos Resultados
          </h2>

          {ultimos.map((r, i) => (

            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px",
              background: "#1e293b",
              marginBottom: "12px",
              borderRadius: "12px",
              fontSize: "26px",
              width: "100%"
            }}>

              <span>
                {r.fullname || r.username}
              </span>

              <span style={{ fontWeight: "bold" }}>
                {r.wpm} WPM • {r.accuracy}%
              </span>

            </div>

          ))}

        </div>

        {/* RANKING */}

        <div style={{ width: "100%" }}>

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
                marginBottom: "14px",
                borderRadius: "14px",
                fontSize: "30px",
                width: "100%",
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
                  <span style={{ fontSize: "34px" }}>
                    {medalha(i)}
                  </span>

                  {r.fullname || r.username}
                </div>

                <div style={{
                  fontWeight: "bold"
                }}>
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
