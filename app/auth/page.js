"use client";

import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("Enviando...");

    const form = new FormData(e.target);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.success) return setMessage("❌ " + data.error);

    setMessage("✔ Usuário criado! Agora faça login.");
    setIsLogin(true);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Verificando...");

    const form = new FormData(e.target);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.success) return setMessage("❌ " + data.error);

    localStorage.setItem("jdc-user", JSON.stringify(data.user));
    window.location.href = "/dashboard";
  }

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "center" }}>
      <h1>{isLogin ? "Entrar" : "Criar Conta"}</h1>

      <button onClick={() => setIsLogin(true)}>Login</button>
      <button onClick={() => setIsLogin(false)}>Registrar</button>

      {isLogin ? (
        <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
          <input name="username" placeholder="Usuário ou Email" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Entrar</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
          <input name="username" placeholder="Usuário" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="idade" placeholder="Idade" required />
          <input name="turma" placeholder="Turma" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Registrar</button>
        </form>
      )}

      <p style={{ marginTop: 20 }}>{message}</p>
    </div>
  );
}
