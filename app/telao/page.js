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

    // últimos resultados
    const ult = data.slice(0, 10);
    setUltimos(ult);

    // remover duplicados mantendo maior wpm
    const mapa = {};

    data.forEach((r) => {
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

  return (

    <div style={{
      background: "#0f172a",
      color: "white",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>

      {/* HEADER COM LÍDER */}

      {lider && (

        <div style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "20px",
          background: "#1e293b",
          borderRadius: "12px"
        }}>

          <div style={{ fontSize: "28px", opacity: 0.7 }}>
            🏆 LÍDER ATUAL
          </div>

          <div style={{
            fontSize: "60px",
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

      {/* LAYOUT 2 COLUNAS */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px"
      }}>

        {/* ESQUERDA */}

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
              padding: "12px",
              background: "#1e293b",
              marginBottom: "8px",
              borderRadius: "8px",
              fontSize: "22px"
            }}>

              <div>
                {r.fullname || r.username}
              </div>

              <div style={{
                display: "flex",
                gap: "20px"
              }}>
                <div>{r.wpm} WPM</div>
                <div>{r.accuracy}%</div>
              </div>

            </div>

          ))}

        </div>

        {/* DIREITA */}

        <div>

          <h2 style={{
            fontSize: "32px",
            marginBottom: "20px"
          }}>
            🏆 Top 10 Geral
          </h2>

          {top.map((r, i) => (

            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px",
              background: i === 0
                ? "#ca8a04"
                : i === 1
                ? "#475569"
                : i === 2
                ? "#78350f"
                : "#1e293b",
              marginBottom: "10px",
              borderRadius: "8px",
              fontSize: "24px",
              fontWeight: i < 3 ? "bold" : "normal"
            }}>

              <div>
                {i + 1}º — {r.fullname || r.username}
              </div>

              <div style={{
                display: "flex",
                gap: "25px"
              }}>
                <div>{r.wpm} WPM</div>
                <div>{r.accuracy}%</div>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}
