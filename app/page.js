
export default function HomePage() {
  return (
    <main>
      <h1 style={{fontSize:28}}>JDC — Teste de Digitação (Escola)</h1>
      <p style={{opacity:0.85}}>Sistema escolar: login local (usuário + senha). Professores/admins podem usar a tabela para ver resultados.</p>
      <div style={{marginTop:20}}>
        <a href="/register" style={{marginRight:12}}>Cadastrar</a>
        <a href="/login">Entrar</a>
        <a href="/test" style={{marginLeft:12}}>Iniciar Teste (precisa estar logado)</a>
        <a href="/ranking" style={{marginLeft:12}}>Ranking</a>
      </div>
    </main>
  );
}
