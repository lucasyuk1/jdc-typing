
import Link from 'next/link'

export default function Header({ user }) {
  return (
    <header className="bg-bg-main border-b border-neon-purple/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            {/* Placeholder logo: use your hummingbird image here */}
            <span className="font-bold text-white">JDC</span>
          </div>
          <div className="text-white font-semibold">JDC — Teste de Digitação</div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/"><a className="text-slate-300 hover:text-white">Início</a></Link>
          <Link href="/test"><a className="text-slate-300 hover:text-white">Teste</a></Link>
          <Link href="/ranking"><a className="text-slate-300 hover:text-white">Ranking</a></Link>
          {user ? (
            <Link href="/profile"><a className="text-slate-300 hover:text-white">Perfil</a></Link>
          ) : (
            <Link href="/login"><a className="text-slate-300 hover:text-white">Entrar</a></Link>
          )}
        </nav>
      </div>
    </header>
  )
}
