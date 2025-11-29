
"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      // store minimal user info
      localStorage.setItem('jdc_user', JSON.stringify({ id: data.user.id, username: data.user.username, is_admin: data.user.is_admin }));
      window.location.href = '/test';
    } else {
      alert('Erro: ' + (data.error || ''));
    }
  }

  return (
    <form onSubmit={handleLogin} style={{maxWidth:420}}>
      <h2>Entrar</h2>
      <input placeholder='Usuário ou email' onChange={e=>setUsername(e.target.value)} className="input" /><br/>
      <input placeholder='Senha' type='password' onChange={e=>setPassword(e.target.value)} className="input" /><br/>
      <button type='submit'>Entrar</button>
    </form>
  );
}
