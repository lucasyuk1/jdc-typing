"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('jdc-user', JSON.stringify({ 
        id: data.user.id, 
        username: data.user.username, 
        turma: data.user.turma, 
        idade: data.user.idade,
        is_admin: data.user.is_admin 
      }));
      window.location.href = '/dashboard';
    } else {
      alert('Erro: ' + (data.error || ''));
    }
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formCardStyle}>
        <h2 style={{ marginBottom: 20, color: "#4a90e2" }}>Entrar</h2>
        <input 
          placeholder='Usuário ou email' 
          onChange={e=>setUsername(e.target.value)} 
          className="input" 
          style={inputStyle}
        />
        <input 
          placeholder='Senha' 
          type='password' 
          onChange={e=>setPassword(e.target.value)} 
          className="input" 
          style={inputStyle}
        />
        <button type='submit' style={buttonStyle}>Entrar</button>
      </form>
    </div>
  );
}
