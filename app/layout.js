import Footer from "@/components/Footer"; // crie o Footer como eu sugeri antes
import "./globals.css";
export const metadata = { title: "Kalangus" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#0A0F1F",
          color: "#fff",
          minHeight: "100vh",
          position: "relative",
          paddingBottom: "80px" // espaço para o footer
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
