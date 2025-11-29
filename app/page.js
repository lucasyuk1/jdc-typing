export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>JDC Typing</h1>
      <p>Redirecionando...</p>
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            try {
              const user = localStorage.getItem('jdc_user');
              if (user) {
                window.location.href = '/dashboard';
              } else {
                window.location.href = '/auth';
              }
            } catch(e) {
              window.location.href = '/auth';
            }
          })();
        `
      }} />
    </main>
  );
}
