"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Mascote from "../images/mascote.png";

export default function AuthPage() {
const [isLogin, setIsLogin] = useState(true);
const [message, setMessage] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const router = useRouter();

const passwordsMatch = password === confirmPassword;

async function handleRegister(e) {
e.preventDefault();
setMessage("");

if (!passwordsMatch) {
  setMessage("❌ As senhas não coincidem!");
  return;
}

const form = new FormData(e.target);
const body = Object.fromEntries(form.entries());

setMessage("Enviando...");

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
setMessage("");

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

  localStorage.setItem("jdc-user", JSON.stringify(data.user));
  router.replace("/dashboard");
} catch (err) {
  setMessage("❌ Erro ao logar: " + err.message);
}

}

return ( <div style={containerStyle}>
<div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "15px" }}> <Image src={Mascote} alt="Mascote" width={64} height={64} /> <h1>JDC Teste de Digitação</h1> </div>

  <div style={avatarContainerStyle}>
    <div style={avatarStyle}></div>
  </div>

  <h1 style={titleStyle}>{isLogin ? "Entrar" : "Criar Conta"}</h1>

  <div style={toggleStyle}>
    <button
      onClick={() => setIsLogin(true)}
      disabled={isLogin}
      style={isLogin ? activeButtonStyle : inactiveButtonStyle}
    >
      Login
    </button>
    <button
      onClick={() => setIsLogin(false)}
      disabled={!isLogin}
      style={!isLogin ? activeButtonStyle : inactiveButtonStyle}
    >
      Registrar
    </button>
  </div>

  <form
    onSubmit={isLogin ? handleLogin : handleRegister}
    style={formStyle}
    key={isLogin ? "login" : "register"}
  >
    {isLogin ? (
      <>
        <input name="username" placeholder="Usuário ou Email" required style={inputStyle} />
        <input name="password" type="password" placeholder="Senha" required style={inputStyle} />
        <button type="submit" style={submitStyle}>Entrar</button>
      </>
    ) : (
      <>
        <input name="username" placeholder="Usuário" required style={inputStyle} />
        <input name="fullname" placeholder="Nome Completo" required style={inputStyle} />
        <input name="email" type="email" placeholder="Email" required style={inputStyle} />
        <input name="idade" placeholder="Idade" required style={inputStyle} />
        <input name="turma" placeholder="Turma" required style={inputStyle} />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, borderColor: passwordsMatch ? "#ccc" : "red" }}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirme a Senha"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ ...inputStyle, borderColor: passwordsMatch ? "#ccc" : "red" }}
        />
        <button
          type="submit"
          style={{ ...submitStyle, cursor: passwordsMatch ? "pointer" : "not-allowed", opacity: passwordsMatch ? 1 : 0.6 }}
          disabled={!passwordsMatch}
        >
          Registrar
        </button>
      </>
    )}
  </form>

  {message && <p style={{ ...messageStyle, color: passwordsMatch ? "#fff" : "red" }}>{message}</p>}
</div>

);
}

// Estilos ajustados para contêiner compacto
const containerStyle = {
display: "flex",
flexDirection: "column",
alignItems: "center",
maxWidth: "380px",
margin: "50px auto",
textAlign: "center",
padding: "20px 25px",
background: "#1f2937",
borderRadius: "12px",
color: "#fff",
boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
fontFamily: "Arial, sans-serif"
};
const avatarContainerStyle = { display: "flex", justifyContent: "center", marginBottom: "15px" };
const avatarStyle = { width: "70px", height: "70px", background: "#4a90e2", borderRadius: "12px", border: "2px solid #fff" };
const titleStyle = { marginBottom: "20px", fontSize: "26px" };
const toggleStyle = { display: "flex", justifyContent: "center", marginBottom: "10px", gap: "10px" };
const activeButtonStyle = { padding: "8px 18px", border: "none", borderRadius: "8px", background: "#4a90e2", color: "#fff", cursor: "default", fontWeight: "bold" };
const inactiveButtonStyle = { padding: "8px 18px", border: "1px solid #4a90e2", borderRadius: "8px", background: "transparent", color: "#4a90e2", cursor: "pointer", fontWeight: "bold", transition: "0.3s" };
const formStyle = { display: "flex", flexDirection: "column", gap: "12px", width: "100%" };
const inputStyle = { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", outline: "none" };
const submitStyle = { padding: "10px 12px", borderRadius: "8px", border: "none", background: "#4a90e2", color: "#fff", fontSize: "15px", fontWeight: "bold", transition: "0.3s" };
const messageStyle = { marginTop: "15px", fontSize: "15px" };
