export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>JDC Typing</h1>
      <p>Carregando...</p>
      <script dangerouslySetInnerHTML={{
        __html: `
        if (localStorage.getItem("user")) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/auth";
        }
      `}}/>
    </main>
  )
}
