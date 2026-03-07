"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Telao() {

  const [top, setTop] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [lider, setLider] = useState(null);

  async function carregarDados() {

    const { data } = await supabase
      .from("results")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    // remover professor e admin
    const filtrado = data.filter(
      r => r.username !== "larbak" && r.turma !== "Prof"
    );

    // últimos resultados
    const ult = filtrado.slice(0, 10);
    setUltimos(ult);

    // manter apenas melhor resultado por usuário
    const mapa = {};

    filtrado.forEach((r) => {
      if (!mapa[r.username] || r.wpm > mapa[r.username].wpm) {
        mapa[r.username] = r;
      }
    });

    const ranking = Object.values(mapa)
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10);

    setTop(ranking);
    setLider(ranking[0]);

  }

  useEffect(() => {

    carregarDados();

    const intervalo = setInterval(() => {
      carregarDados();
    }, 3000);

    return () => clearInterval(intervalo);

  }, []);

  function medalha(pos) {
    if (pos === 0) return "🥇";
    if (pos === 1) return "🥈";
    if (pos === 2) return "🥉";
    return `${pos + 1}º`;
  }

  return (

    <div style={{
      background: "#0f172a",
      color: "white",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "sans-serif"
    }}>

      {/* HEADER LÍDER */}

      {lider && (

        <div style={{
          textAlign: "center",
          marginBottom: "35px",
          padding: "25px",
          background: "#1e293b",
          borderRadius: "14px",
          border: "2px solid #eab308"
        }}>

          <div style={{
            fontSize: "28px",
            opacity: 0.7
          }}>
            🏆 LÍDER DO RANKING
          </div>

          <div style={{
            fontSize: "64px",
            fontWeight: "bold",
            marginTop: "10px"
          }}>
            {lider.fullname || lider.username}
          </div>

          <div style={{
            fontSize: "40px",
            marginTop: "10px",
            color: "#22c55e"
          }}>
            {lider.wpm} WPM • {lider.accuracy}%
          </div>

        </div>

      )}

      {/* GRID PRINCIPAL */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "35px"
      }}>

        {/* ESQUERDA - ÚLTIMOS */}

        <div>

          <h2 style={{
            fontSize: "32px",
            marginBottom: "20px"
          }}>
            ⏱ Últimos Resultados
          </h2>

          {ultimos.map((r, i) => (

            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px",
              background: "#1e293b",
              marginBottom: "10px",
              borderRadius: "10px",
              fontSize: "22px"
            }}>

              <div>
                {r.fullname || r.username}
              </div>

              <div style={{
                display: "flex",
                gap: "25px",
                fontWeight: "bold"
              }}>
                <span>{r.wpm} WPM</span>
                <span>{r.accuracy}%</span>
              </div>

            </div>

          ))}

        </div>

        {/* DIREITA - TOP 10 */}

        <div>

          <h2 style={{
            fontSize: "34px",
            marginBottom: "20px"
          }}>
            🏆 Ranking Geral
          </h2>

          {top.map((r, i) => (

            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "12px",
              fontSize: "26px",
              background:
                i === 0 ? "#78350f" :
                i === 1 ? "#334155" :
                i === 2 ? "#92400e" :
                "#1e293b",
              border:
                i === 0 ? "2px solid gold" :
                i === 1 ? "2px solid silver" :
                i === 2 ? "2px solid #cd7f32" :
                "1px solid #334155"
            }}>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontWeight: i < 3 ? "bold" : "normal"
              }}>

                <span style={{
                  fontSize: "30px",
                  width: "45px"
                }}>
                  {medalha(i)}
                </span>

                <span>
                  {r.fullname || r.username}
                </span>

              </div>

              <div style={{
                display: "flex",
                gap: "28px",
                fontWeight: "bold"
              }}>
                <span>{r.wpm} WPM</span>
                <span>{r.accuracy}%</span>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}
