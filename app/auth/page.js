"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
const [isLogin, setIsLogin] = useState(true);
const [message, setMessage] = useState("");
const router = useRouter();

async function handleRegister(e) {
e.preventDefault();
setMessage("Enviando...");

const form = new FormData(e.target);
const body = Object.fromEntries(form.entries());

try {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) return setMessage("❌ " + data.error);

  setMessage("✔ Usuário criado! Agora faça login.");
  setIsLogin(true);
} catch (err) {
  setMessage("❌ Erro ao registrar: " + err.message);
}

}

async function handleLogin(e) {
e.preventDefault();
setMessage("Verificando...");

const form = new FormData(e.target);
const body = Object.fromEntries(form.entries());

try {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) return setMessage("❌ " + data.error);

  // Armazena usuário no localStorage
  localStorage.setItem("jdc-user", JSON.stringify(data.user));

  // Redireciona para dashboard
  router.replace("/dashboard");
} catch (err) {
  setMessage("❌ Erro ao logar: " + err.message);
}


}

return (
<div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "center" }}> <h1>{isLogin ? "Entrar" : "Criar Conta"}</h1>

  <div style={{ marginBottom: 20 }}>
    <button onClick={() => setIsLogin(true)} disabled={isLogin}>Login</button>
    <button onClick={() => setIsLogin(false)} disabled={!isLogin}>Registrar</button>
  </div>

  {isLogin ? (
    <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
      <input name="username" placeholder="Usuário ou Email" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
    </form>
  ) : (
    <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
      <input name="username" placeholder="Usuário" required />
      <input name="fullname" placeholder="Nome Completo" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="idade" placeholder="Idade" required />
      <input name="turma" placeholder="Turma" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Registrar</button>
    </form>
  )}

  {message && <p style={{ marginTop: 20 }}>{message}</p>}
</div>

);
}
