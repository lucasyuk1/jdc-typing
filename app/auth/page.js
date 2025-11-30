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

  localStorage.setItem("jdc-user", JSON.stringify(data.user));
  router.replace("/dashboard");
} catch (err) {
  setMessage("❌ Erro ao logar: " + err.message);
}

}

return ( <div style={containerStyle}>
{/* Foto de perfil */} <div style={avatarContainerStyle}> <div style={avatarStyle}></div> </div>

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

  <div style={{ position: "relative", minHeight: "380px" }}>
    <form
      onSubmit={isLogin ? handleLogin : handleRegister}
      style={{
        ...formStyle,
        opacity: 1,
        transition: "opacity 0.5s ease",
      }}
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
          <input name="password" type="password" placeholder="Senha" required style={inputStyle} />
          <button type="submit" style={submitStyle}>Registrar</button>
        </>
      )}
    </form>
  </div>

  {message && <p style={messageStyle}>{message}</p>}
</div>

);
}

// Estilos
const containerStyle = {
maxWidth: "400px",
margin: "60px auto",
textAlign: "center",
padding: "30px",
background: "#1f2937",
borderRadius: "12px",
color: "#fff",
boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
fontFamily: "Arial, sans-serif"
};

const avatarContainerStyle = {
display: "flex",
justifyContent: "center",
marginBottom: "20px"
};

const avatarStyle = {
width: "80px",
height: "80px",
background: "#4a90e2",
borderRadius: "12px",
border: "2px solid #fff"
};

const titleStyle = {
marginBottom: "25px",
fontSize: "28px"
};

const toggleStyle = {
display: "flex",
justifyContent: "center",
marginBottom: "10px",
gap: "10px"
};

const activeButtonStyle = {
padding: "10px 20px",
border: "none",
borderRadius: "8px",
background: "#4a90e2",
color: "#fff",
cursor: "default",
fontWeight: "bold"
};

const inactiveButtonStyle = {
padding: "10px 20px",
border: "1px solid #4a90e2",
borderRadius: "8px",
background: "transparent",
color: "#4a90e2",
cursor: "pointer",
fontWeight: "bold",
transition: "0.3s"
};

const formStyle = {
display: "flex",
flexDirection: "column",
gap: "15px"
};

const inputStyle = {
padding: "12px 15px",
borderRadius: "8px",
border: "1px solid #ccc",
fontSize: "16px",
outline: "none"
};

const submitStyle = {
padding: "12px 15px",
borderRadius: "8px",
border: "none",
background: "#4a90e2",
color: "#fff",
fontSize: "16px",
fontWeight: "bold",
cursor: "pointer",
transition: "0.3s"
};

const messageStyle = {
marginTop: "20px",
fontSize: "16px"
};
