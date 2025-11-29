"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("jdc-user");
    if (!u) {
      window.location.href = "/auth";
    } else {
      setUser(JSON.parse(u));
    }
  }, []);

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Olá, {user.username}!</h1>
      <p>Turma: {user.turma}</p>
      <p>Idade: {user.idade}</p>

      <nav style={{ marginTop: 20 }}>
        <a href="/test">Fazer teste de digitação</a><br />
        <a href="/ranking">Ver ranking</a>
      </nav>
    </div>
  );
}
