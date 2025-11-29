
export const metadata = { title: "JDC Typing" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0A0F1F', color: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
