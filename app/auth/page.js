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

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6"> <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md"> <div className="flex flex-col items-center mb-6"> <Image
         src={Mascote}
         alt="Mascote"
         width={90}
         height={90}
         className="drop-shadow-xl mb-2"
       /> <h1 className="text-2xl font-bold text-blue-300 tracking-wide">
Kalangus Type </h1> </div>

    {/* Toggle Login / Registro */}
    <div className="flex gap-3 justify-center mb-6">
      <button
        onClick={() => setIsLogin(true)}
        disabled={loading}
        className={`px-5 py-2 rounded-lg font-semibold transition-all ${
          isLogin
            ? "bg-blue-500 text-white shadow-lg"
            : "border border-blue-400 text-blue-300 hover:bg-blue-500/20"
        }`}
      >
        Login
      </button>

      <button
        onClick={() => setIsLogin(false)}
        disabled={loading}
        className={`px-5 py-2 rounded-lg font-semibold transition-all ${
          !isLogin
            ? "bg-blue-500 text-white shadow-lg"
            : "border border-blue-400 text-blue-300 hover:bg-blue-500/20"
        }`}
      >
        Registrar
      </button>
    </div>

    {isLogin ? (
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          name="username"
          placeholder="Usuário ou Email"
          required
          disabled={loading}
          className="input-auth"
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          disabled={loading}
          className="input-auth"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-auth flex justify-center items-center gap-2"
        >
          {loading ? "Carregando..." : "Entrar"}
        </button>
      </form>
    ) : (
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input name="username" placeholder="Usuário" required disabled={loading} className="input-auth" />
        <input name="fullname" placeholder="Nome Completo" required disabled={loading} className="input-auth" />
        <input name="email" type="email" placeholder="Email" required disabled={loading} className="input-auth" />
        <input name="idade" placeholder="Idade" required disabled={loading} className="input-auth" />

        <select name="turma" required disabled={loading} className="input-auth">
          <option value="" disabled selected>
            Selecione a Turma
          </option>
          {turmas.map((t) => (
            <option key={t.id} value={t.turma_name}>
              {t.turma_name}
            </option>
          ))}
        </select>

        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`}
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirme a Senha"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`}
        />

        <button
          type="submit"
          disabled={!passwordsMatch || loading}
          className={`btn-auth ${passwordsMatch ? "" : "opacity-50 cursor-not-allowed"} flex justify-center items-center gap-2`}
        >
          {loading ? "Carregando..." : "Registrar"}
        </button>
      </form>
    )}

    {message && (
      <p className={`text-center mt-4 text-sm ${message.includes("❌") ? "text-red-400" : "text-green-300"}`}>
        {message}
      </p>
    )}
  </div>
</div>

);
}
