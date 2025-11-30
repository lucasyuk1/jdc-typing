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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <div className="flex flex-col items-center mb-6">
          <Image
            src={Mascote}
            alt="Mascote"
            width={90}
            height={90}
            className="drop-shadow-xl mb-2"
          />
          <h1 className="text-2xl font-bold text-blue-300 tracking-wide">
            Kalangus Type
          </h1>
        </div>

        {/* Toggle Login / Registro */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
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
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              !isLogin
                ? "bg-blue-500 text-white shadow-lg"
                : "border border-blue-400 text-blue-300 hover:bg-blue-500/20"
            }`}
          >
            Registrar
          </button>
        </div>

        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="flex flex-col gap-4"
        >
          {isLogin ? (
            <>
              <input
                name="username"
                placeholder="Usuário ou Email"
                required
                className="input-auth"
              />

              <input
                name="password"
                type="password"
                placeholder="Senha"
                required
                className="input-auth"
              />
              <button className="btn-auth">Entrar</button>
            </>
          ) : (
            <>
              <input name="username" placeholder="Usuário" required className="input-auth" />
              <input name="fullname" placeholder="Nome Completo" required className="input-auth" />
              <input name="email" type="email" placeholder="Email" required className="input-auth" />
              <input name="idade" placeholder="Idade" required className="input-auth" />
              <input name="turma" placeholder="Turma" required className="input-auth" />

              <input
                name="password"
                type="password"
                placeholder="Senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`}
              />

              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirme a Senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-auth ${passwordsMatch ? "" : "border-red-500"}`}
              />

              <button
                type="submit"
                disabled={!passwordsMatch}
                className={`btn-auth ${passwordsMatch ? "" : "opacity-50 cursor-not-allowed"}`}
              >
                Registrar
              </button>
            </>
          )}
        </form>

        {/* Mensagem */}
        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.includes("❌") ? "text-red-400" : "text-green-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
