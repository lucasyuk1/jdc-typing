"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateRandomText } from "@/lib/textGenerator";
import MascoteFeliz from "../images/mascote-feliz.png";
import MascoteTriste from "../images/mascote-triste.png";
import MascoteRaiva from "../images/mascote-raiva.png";
import Image from "next/image";

export default function TestePage() {
const router = useRouter();
const [text, setText] = useState("");
const [pos, setPos] = useState(0);
const [states, setStates] = useState([]);
const [started, setStarted] = useState(false);
const [timeLeft, setTimeLeft] = useState(180);
const [finished, setFinished] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const inputRef = useRef(null);
const charRefs = useRef([]);
const [correctCount, setCorrectCount] = useState(0);
const [wrongCount, setWrongCount] = useState(0);
const [user, setUser] = useState(null);
const [media, setMedia] = useState(null);
const [comparisonText, setComparisonText] = useState("");
const [redirectCounter, setRedirectCounter] = useState(10);

const [MascoteAtual, setMascoteAtual] = useState(MascoteFeliz);
const [MascoteFade, setMascoteFade] = useState(true);
const [MascoteAnim, setMascoteAnim] = useState("");

useEffect(() => {
const u = localStorage.getItem("jdc-user");
if (!u) return router.push("/auth");
const parsed = JSON.parse(u);
setUser(parsed);

async function loadMedia() {
  try {
    const res = await fetch("/api/results/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "pessoal", usuario_id: parsed.id }),
    });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      const sorted = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const soma = sorted.reduce((acc, r) => acc + r.wpm, 0);
      setMedia(Math.round(soma / sorted.length));
    } else setMedia(null);
  } catch (err) { console.error(err); setMedia(null); }
}

loadMedia();
setTimeout(() => inputRef.current?.focus(), 100);

}, [router]);

useEffect(() => {
const t = generateRandomText(200);
setText(t);
setStates(new Array(t.length).fill("pending"));
}, []);

useEffect(() => {
if (charRefs.current[pos]) charRefs.current[pos].scrollIntoView({ behavior: "smooth", block: "center" });
}, [pos]);

function maybeExtendText() {
if (pos < text.length - 200) return;
const extra = generateRandomText(300);
setText(prev => prev + " " + extra);
setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);
}

function handleKey(e) {
const key = e.key;
if (key === "Backspace") {
setErrorMessage("Não tente apagar o passado. Cada tecla errada é um passo para a frente.");
setTimeout(() => setErrorMessage(""), 5000);
e.preventDefault();
return;
}
if (!started) setStarted(true);
e.preventDefault();
if (key.length !== 1) return;
const expected = text[pos];
setStates(old => { const updated = [...old]; updated[pos] = expected === key ? "correct" : "wrong"; return updated; });
expected === key ? setCorrectCount(c => c + 1) : setWrongCount(w => w + 1);
setPos(pos + 1);
maybeExtendText();
}

const totalTyped = correctCount + wrongCount;
const accuracy = totalTyped > 0 ? Number(((correctCount / totalTyped) * 100).toFixed(1)) : 100;
const elapsed = 180 - timeLeft;
const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;

// Atualiza o mascote em tempo real com animação
useEffect(() => {
if (media === null || finished) return;
let novoMascote = MascoteFeliz;
let anim = "";
const diff = wpm - media;
if (diff < - 5) { novoMascote = MascoteRaiva; anim = "shake"; }
else if (diff < 0) { novoMascote = MascoteTriste; anim = "tilt"; }
else { novoMascote = MascoteFeliz; anim = "bounce"; }

setMascoteFade(false);
setTimeout(() => { setMascoteAtual(novoMascote); setMascoteFade(true); setMascoteAnim(anim); }, 200);

}, [wpm, media, finished]);

function getBrasiliaISO() {
const brasiliaTime = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
return new Date(brasiliaTime).toISOString();
}

async function salvarResultado() {
if (!user) return;
try {
await fetch("/api/results", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
usuario_id: user.id,
username: user.username,
turma: user.turma,
wpm,
accuracy,
tempo_segundos: 180,
created_at: getBrasiliaISO(),
}),
});
} catch (err) { console.error(err); }
}

useEffect(() => {
if (!started || finished) return;
if (timeLeft <= 0) { finalizarTeste(); return; }
const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
return () => clearInterval(i);
}, [started, timeLeft, finished]);

function finalizarTeste() {
setFinished(true);
salvarResultado();
const c = setInterval(() => {
setRedirectCounter(t => { if (t <= 1) { clearInterval(c); router.push("/dashboard"); } return t - 1; });
}, 1000);
}

const wpmColor = wpm < 10 ? "text-red-600" : wpm < 20 ? "text-yellow-500" : wpm < 30 ? "text-blue-600" : "text-green-400";
const minutos = Math.floor(timeLeft / 60);
const segundos = timeLeft % 60;

if (!user) return <p className="text-center mt-10">Carregando...</p>;

return ( <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-900 px-4 py-6">
{/* Top Info + Mascote */} <div className="sticky top-0 z-20 w-full max-w-5xl bg-gray-800 rounded-b-lg shadow-md p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4"> <div className="flex flex-col md:flex-row items-center gap-6">
<div className={`flex-shrink-0 w-32 h-32 md:w-40 md:h-40 transition-all duration-300 ease-in-out transform ${MascoteFade ? "opacity-100 rotate-0" : "opacity-0 -rotate-6"} ${MascoteAnim}`}> <Image src={MascoteAtual} alt="Mascote" width={160} height={160} className="drop-shadow-2xl transition-all duration-300 ease-in-out" /> </div> <div className="text-center md:text-left"> <h1 className="text-2xl font-bold mb-2">Teste de Digitação - 3 Minutos</h1> <p className="text-lg">Tempo restante: <b>{`${minutos.toString().padStart(2,"0")}:${segundos.toString().padStart(2,"0")}`}</b></p>
<p className={`text-lg ${wpmColor}`}>WPM: <b>{wpm}</b></p> <p>Média: <b>{media !== null ? media : "—"}</b></p>
<p className={`text-lg ${accuracy < 70 ? "text-red-600" : "text-green-400"}`}>Precisão: <b>{accuracy}%</b></p> <p className="text-lg mt-1">Letras digitadas: <b>{totalTyped}</b> (<span className="text-green-400">{correctCount}</span> corretas, <span className="text-red-500">{wrongCount}</span> erradas)</p> </div> </div> </div>

  {/* Mensagem de Backspace */}
  <div className="w-full max-w-5xl p-2 text-center min-h-[2rem]">
    {errorMessage && <span className="text-red-500 font-semibold">{errorMessage}</span>}
  </div>

  {/* Área de digitação */}
  <div onClick={() => inputRef.current.focus()} className="flex-1 p-6 overflow-y-auto bg-gray-800 rounded-lg font-mono text-gray-300 text-lg leading-relaxed cursor-text min-h-[60vh] max-w-5xl w-full">
    {text.split("").map((ch,i)=>{
      const isCursor = i===pos;
      const colorClass = states[i]==="correct"?"char-correct":states[i]==="wrong"?"char-wrong":"";
      const cursorClass = isCursor?"char-current animate-blink":"";
      return <span key={i} ref={el => charRefs.current[i]=el} className={`${colorClass} ${cursorClass}`}>{ch}</span>
    })}
  </div>

  {finished && (
    <div className="flex-1 flex flex-col justify-center items-center text-center mt-8 max-w-3xl">
      <h2 className="text-3xl font-bold mb-4">Tempo Encerrado!</h2>
      <p className={`text-2xl mb-2 ${wpmColor}`}>WPM: <b>{wpm}</b></p>
      <p><b>Média:</b> {media !== null ? media : "—"}</p>
      <p className={`text-2xl mb-2 ${accuracy < 70 ? "text-red-600" : "text-green-400"}`}>Precisão: <b>{accuracy}%</b></p>
      <p className="mt-6 text-lg font-bold">{comparisonText}</p>
      <p className="mt-2 text-gray-300">Alongue os dedos enquanto espera...</p>
      <p className="mt-4 text-gray-400 text-lg">Redirecionando em {redirectCounter}...</p>
    </div>
  )}

  <input ref={inputRef} onKeyDown={handleKey} className="opacity-0 absolute pointer-events-none" />

  <style jsx>{`
    @keyframes blink { 50% { border-color: transparent; } }
    .animate-blink { animation: blink 1s step-start infinite; }
    .char-current { border-left: 2px solid #4a90e2; }
    .char-correct { color: #34d399; }
    .char-wrong { color: #f87171; }
    .bounce { animation: bounce 0.6s ease; }
    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-15px); } 60% { transform: translateY(-7px); } }
    .shake { animation: shake 0.5s ease; }
    @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
    .tilt { animation: tilt 0.6s ease; }
    @keyframes tilt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-10deg); } }
  `}</style>
</div>

);
}
