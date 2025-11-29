
"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [idade, setIdade] = useState("");
  const [turma, setTurma] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, fullname, email, idade, turma, password })
    });
    const data = await res.json();
    if (data.success) {
      alert('Cadastrado com sucesso. Faça login.');
      window.location.href = '/login';
    } else {
      alert('Erro: ' + (data.error || ''));
    }
  }

  return (
    <form onSubmit={handleRegister} style={{maxWidth:420}}>
      <h2>Cadastrar</h2>
      <input placeholder='Usuário' onChange={e=>setUsername(e.target.value)} className="input" /><br/>
      <input placeholder='Nome Completo' onChange={e=>setFullname(e.target.value)} className="input" /><br/>
      <input placeholder='Email' onChange={e=>setEmail(e.target.value)} className="input" /><br/>
      <input placeholder='Idade' onChange={e=>setIdade(e.target.value)} className="input" /><br/>
      <input placeholder='Turma' onChange={e=>setTurma(e.target.value)} className="input" /><br/>
      <input placeholder='Senha' type='password' onChange={e=>setPassword(e.target.value)} className="input" /><br/>
      <button type='submit'>Registrar</button>
    </form>
  );
}
