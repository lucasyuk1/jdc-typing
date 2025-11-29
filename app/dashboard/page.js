"use client";

export default function Dashboard() {
  let user = null;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("jdc_user") || "null");
  }

  function logout() {
    localStorage.removeItem("jdc_user");
    document.cookie = "user_session=; Max-Age=0; path=/;";
    window.location.href = "/auth";
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Bem-vindo{user ? `, ${user.username}` : ""}</h1>
      <p>Turma: {user?.turma || "-"}</p>
      <p>Idade: {user?.idade || "-"}</p>

      <div style={{ marginTop: 20 }}>
        <a href="/typing">Iniciar teste</a> {" | "} 
        <a href="/ranking">Ranking</a> {" | "}
        <a href="/admin">Admin</a>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={logout}>Sair</button>
      </div>
    </main>
  );
}
