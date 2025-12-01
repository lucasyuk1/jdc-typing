"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateRandomText } from "@/lib/textGenerator";

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

const [animatedWPM, setAnimatedWPM] = useState(0);
const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

const [user, setUser] = useState(null);
const [media, setMedia] = useState(null);
const [comparisonText, setComparisonText] = useState("");
const [redirectCounter, setRedirectCounter] = useState(10);

// ============ Load user & média ============
useEffect(() => {
window.scrollTo(0, 0);
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
    } else {
      setMedia(null);
    }
  } catch (err) { console.error(err); setMedia(null); }
}

loadMedia();
setTimeout(() => inputRef.current?.focus(), 100);

}, [router]);

// ============ Generate initial text ============
useEffect(() => {
const t = generateRandomText(200);
setText(t);
setStates(new Array(t.length).fill("pending"));
}, []);

// ============ Scroll cursor ============
useEffect(() => {
if (charRefs.current[pos]) {
charRefs.current[pos].scrollIntoView({ behavior: "smooth", block: "center" });
}
}, [pos]);

// ============ Extend text ============
function maybeExtendText() {
if (pos < text.length - 200) return;
const extra = generateRandomText(300);
setText(prev => prev + " " + extra);
setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);
}

// ============ Typing handler ============
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
setStates(old => {
  const updated = [...old];
  updated[pos] = expected === key ? "correct" : "wrong";
  return updated;
});

expected === key ? setCorrectCount(c => c + 1) : setWrongCount(w => w + 1);
setPos(pos + 1);
maybeExtendText();

}

const totalTyped = correctCount + wrongCount;
const accuracy = totalTyped > 0 ? Number(((correctCount / totalTyped) * 100).toFixed(1)) : 100;
const elapsed = 180 - timeLeft;
const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;

function animateResults() {
let w = 0, a = 0;
const wi = setInterval(() => { w++; setAnimatedWPM(w); if (w >= wpm) clearInterval(wi); }, 20);
const ai = setInterval(() => { a++; setAnimatedAccuracy(a); if (a >= accuracy) clearInterval(ai); }, 15);
}

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

// ============ Timer ============
useEffect(() => {
if (!started || finished) return;
if (timeLeft <= 0) { finalizarTeste(); return; }
const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
return () => clearInterval(i);
}, [started, timeLeft, finished]);

// ============ Finish test ============
function finalizarTeste() {
setFinished(true);
salvarResultado();
animateResults();

const c = setInterval(() => {
  setRedirectCounter(t => {
    if (t <= 1) { clearInterval(c); router.push("/dashboard"); }
    return t - 1;
  });
}, 1000);

}

// ============ Compare with media ============
useEffect(() => {
if (!finished) return;
if (media === null) setComparisonText("Primeiro teste — ainda sem média!");
else {
const diff = wpm - media;
if (diff > 0) setComparisonText(`↑ Excelente! Acima da média em ${diff} ponto${diff > 1 ? "s" : ""}.`);
else if (diff < 0) setComparisonText(`↓ Você ficou abaixo da média em ${Math.abs(diff)} ponto${Math.abs(diff) > 1 ? "s" : ""}.`);
else setComparisonText("Você ficou exatamente na média!");
}
}, [media, finished, wpm]);

const wpmColor = wpm < 10 ? "text-red-600" : wpm < 20 ? "text-yellow-500" : wpm < 30 ? "text-blue-600" : "text-green-400";
const accuracyColor = accuracy < 70 ? "text-red-600" : accuracy < 90 ? "text-yellow-500" : "text-green-400";
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;

if (!user) return <p className="text-center mt-10">Carregando...</p>;

return ( <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-900 px-4 py-6">

  {/* Top Bar */}
  {!finished && (
    <div className="sticky top-0 z-20 w-full max-w-5xl bg-gray-800 rounded-b-lg shadow-md p-6 text-center">
      <h1 className="text-2xl font-bold mb-3">Teste de Digitação - 3 Minutos</h1>
      <div className="flex flex-wrap justify-center gap-4 text-center">
        {["Tempo","WPM","Média","Precisão","Digitado"].map((label,i) => {
          let value;
          switch(label){
            case "Tempo": value = `${minutes}:${seconds.toString().padStart(2,'0')}`; break;
            case "WPM": value = (<><span className={wpmColor}>{wpm}</span>{media !== null && (wpm>media?<span className="text-green-400">▲</span>:wpm<media?<span className="text-red-600">▼</span>:<span className="text-yellow-400">—</span>)}</>); break;
            case "Média": value = media !== null ? media : "—"; break;
            case "Precisão": value = (<span className={accuracyColor}>{accuracy}%</span>); break;
            case "Digitado": value = totalTyped; break;
          }
          return (
            <div key={i} className="bg-gray-700 p-4 rounded-lg w-32 shadow-md">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )}

  {/* Mensagem de Backspace */}
  <div className="w-full max-w-5xl p-2 text-center min-h-[2rem]">
    {errorMessage && <span className="text-red-500 font-semibold">{errorMessage}</span>}
  </div>

  {/* Typing Area */}
  {!finished ? (
    <div
      onClick={() => inputRef.current.focus()}
      className="flex-1 w-full max-w-5xl p-6 overflow-y-auto bg-gray-800 rounded-lg font-mono text-gray-300 text-lg leading-relaxed cursor-text min-h-[60vh]"
    >
      {text.split("").map((ch,i)=>{
        const isCursor = i===pos;
        const colorClass = states[i]==="correct"?"char-correct":states[i]==="wrong"?"char-wrong":"";
        const cursorClass = isCursor?"char-current animate-blink":"";
        return <span key={i} ref={el => charRefs.current[i]=el} className={`${colorClass} ${cursorClass}`}>{ch}</span>
      })}
    </div>
  ) : (
    <div className="flex-1 flex flex-col justify-center items-center text-center mt-8 max-w-3xl">
      <h2 className="text-3xl font-bold mb-4">Tempo Encerrado!</h2>
      <p className={`text-2xl mb-2 ${wpmColor}`}>WPM: <b>{animatedWPM}</b></p>
      <p><b>Média:</b> {media !== null ? media : "—"}</p>
      <p className={`text-2xl mb-2 ${accuracyColor}`}>Precisão: <b>{animatedAccuracy}%</b></p>
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
  `}</style>

</div>

);
}
