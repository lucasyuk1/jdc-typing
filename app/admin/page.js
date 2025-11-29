
"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [rows, setRows] = useState([]);

  useEffect(()=> {
    async function load() {
      const res = await fetch('/api/results');
      const data = await res.json();
      setRows(data || []);
    }
    load();
  }, []);

  async function del(id) {
    if (!confirm('Apagar?')) return;
    await fetch('/api/results', { method: 'DELETE', body: JSON.stringify({ id })});
    setRows(rows.filter(r=>r.id!==id));
  }

  return (
    <div>
      <h2>Painel Admin</h2>
      <table style={{width:'100%'}}><thead><tr><th>Usuário</th><th>WPM</th><th>Data</th><th>Ações</th></tr></thead>
      <tbody>
        {rows.map(r=>(
          <tr key={r.id}><td>{r.username}</td><td>{r.wpm}</td><td>{new Date(r.created_at).toLocaleString()}</td><td><button onClick={()=>del(r.id)}>Apagar</button></td></tr>
        ))}
      </tbody></table>
    </div>
  );
}
