"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("jdc-user", JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        turma: data.user.turma,
        idade: data.user.idade,
        is_admin: data.user.is_admin
      }));
      window.location.href = "/dashboard";
    } else {
      alert("Erro: " + (data.error || ""));
    }
  }

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    background: "#0A0F1F",
    fontFamily: "Arial, sans-serif"
  };

  const formCardStyle = {
    background: "#1f2937",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
    width: 360,
    display: "flex",
    flexDirection: "column"
  };

  const inputStyle = {
    padding: "12px 15px",
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #444",
    background: "#111827",
    color: "#fff",
    fontSize: 16
  };

  const buttonStyle = {
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "#4a90e2",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formCardStyle}>
        <h2 style={{ marginBottom: 20, color: "#4a90e2", textAlign: "center" }}>Entrar</h2>
        <input placeholder="Usuário ou email" onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input placeholder="Senha" type="password" onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={buttonStyle}>Entrar</button>
        <p style={{ marginTop: 15, color: "#aaa", fontSize: 14, textAlign: "center" }}>
          Não tem conta? <Link href="/register" style={{ color: "#4a90e2" }}>Registrar</Link>
        </p>
      </form>
    </div>
  );
}
