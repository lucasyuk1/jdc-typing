"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Mascote from "../images/mascote.png";

export default function AuthPage() {
const [isLogin, setIsLogin] = useState(true);
const [message, setMessage] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [turmas, setTurmas] = useState([]);
const router = useRouter();

const passwordsMatch = password === confirmPassword;

// Carrega turmas via API
useEffect(() => {
if (!isLogin) {
fetch("/api/turmas")
.then((res) => res.json())
.then((data) => {
if (data.success && data.turmas) setTurmas(data.turmas);
})
.catch((err) => console.error("Erro ao carregar turmas:", err));
}
}, [isLogin]);

async function handleRegister(e) {
e.preventDefault();
setMessage("");

if (!passwordsMatch) {
  setMessage("❌ As senhas não coincidem!");
  return;
}

const form = new FormData(e.target);
const body = Object.fromEntries(form.entries());

setLoading(true);
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
} finally {
  setLoading(false);
}

}

async function handleLogin(e) {
e.preventDefault();
setMessage("");
setLoading(true);

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
} finally {
  setLoading(false);
}

}

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6 relative overflow-hidden">

  {/* Mascote grande flutuante sobrepondo a caixa */}
  <div className="absolute -top-32 -right-32 w-72 h-72 z-50 animate-float pointer-events-none">
    <Image
      src={Mascote}
      alt="TypingBoo Mascote"
      width={288}
      height={288}
      className="drop-shadow-2xl"
    />
  </div>

  {/* Caixa de login / registro */}
  <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md relative z-10">
    
    {/* Título */}
    <div className="flex flex-col items-center mb-6 relative z-10">
      <h1 className="text-3xl font-bold text-purple-400 tracking-wide">TypingBoo</h1>
    </div>

    {/* Toggle Login / Registro */}
    <div className="flex gap-3 justify-center mb-6 relative z-10">
      <button
        onClick={() => setIsLogin(true)}
        disabled={loading}
        className={`btn-auth ${isLogin ? "" : "opacity-70"} px-5 py-2`}
      >
        Login
      </button>
      <button
        onClick={() => setIsLogin(false)}
        disabled={loading}
        className={`btn-auth ${!isLogin ? "" : "opacity-70"} px-5 py-2`}
      >
        Registrar
      </button>
    </div>

    {isLogin ? (
      <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
        <input name="username" placeholder="Usuário ou Email" required disabled={loading} className="input-auth" />
        <input name="password" type="password" placeholder="Senha" required disabled={loading} className="input-auth" />
        <button type="submit" disabled={loading} className="btn-auth flex justify-center items-center gap-2">
          {loading ? "Carregando..." : "Entrar"}
        </button>
      </form>
    ) : (
      <form onSubmit={handleRegister} className="flex flex-col gap-4 relative z-10">
        <input name="username" placeholder="Usuário" required disabled={loading} className="input-auth" />
        <input name="fullname" placeholder="Nome Completo" required disabled={loading} className="input-auth" />
        <input name="email" type="email" placeholder="Email" required disabled={loading} className="input-auth" />
        <input name="idade" placeholder="Idade" required disabled={loading} className="input-auth" />
        <select name="turma" required disabled={loading} className="input-auth">
          <option value="" disabled selected>Selecione a Turma</option>
          {turmas.map((t) => <option key={t.id} value={t.turma_name}>{t.turma_name}</option>)}
        </select>
        <input name="password" type="password" placeholder="Senha" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`} />
        <input name="confirmPassword" type="password" placeholder="Confirme a Senha" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`} />
        <button type="submit" disabled={!passwordsMatch || loading} className={`btn-auth ${passwordsMatch ? "" : "opacity-50 cursor-not-allowed"} flex justify-center items-center gap-2`}>
          {loading ? "Carregando..." : "Registrar"}
        </button>
      </form>
    )}

    {message && (
      <p className={`text-center mt-4 text-sm ${message.includes("❌") ? "text-red-400" : "text-green-300"} relative z-10`}>
        {message}
      </p>
    )}
  </div>

  {/* Animação do mascote flutuando */}
  <style jsx>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px) rotate(-5deg); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  `}</style>
</div>

);
}
