
"use client";
import { useEffect, useState } from "react";

export default function RankingPage() {
  const [rows, setRows] = useState([]);

  useEffect(()=> {
    async function load() {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      setRows(data || []);
    }
    load();
  }, []);

  return (
    <div>
      <h2>Ranking Geral</h2>
      <table style={{width:'100%', marginTop:8}}>
        <thead><tr><th>Aluno</th><th>Turma</th><th>WPM</th><th>Data</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}><td>{r.username || r.name}</td><td>{r.turma}</td><td>{r.wpm}</td><td>{new Date(r.created_at).toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
