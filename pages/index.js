
import Header from '../components/Header'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-main text-white">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-card rounded-2xl p-6">
            <h1 className="text-3xl font-bold">Teste de Digitação</h1>
            <p className="mt-3 text-slate-300">Treine velocidade e precisão. Rank por turma, geral e pessoal.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/test"><a className="px-4 py-2 bg-neon-purple rounded text-white">Iniciar teste</a></Link>
              <Link href="/ranking"><a className="px-4 py-2 border border-neon-blue rounded text-white">Ver ranking</a></Link>
            </div>
          </div>
          <div className="card bg-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Sobre</h2>
            <p className="mt-3 text-slate-300">Interface inspirada em visual neon + logotipo JDC (beija-flor). Ideal para uso escolar.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
