"use client";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "20px 0",
        textAlign: "center",
        background: "#222",
        color: "#fff",
        position: "fixed",
        bottom: 0,
        left: 0,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
        fontSize: 14,
        zIndex: 100
      }}
    >
      © {new Date().getFullYear()} IndexL — Prof. Lucas C. Silveira. Todos os direitos reservados.
    </footer>
  );
}
