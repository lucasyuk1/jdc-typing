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
const [mediaLoaded, setMediaLoaded] = useState(false);
const [comparisonText, setComparisonText] = useState("");

const [redirectCounter, setRedirectCounter] = useState(5);

// ============ Load user & media ============
useEffect(() => {
window.scrollTo(0, 0);
const u = localStorage.getItem("jdc-user");
if (!u) return router.push("/auth");

const parsed = JSON.parse(u);
setUser(parsed);

fetch(`/api/userMedia?user_id=${parsed.id}`)
  .then(r => r.json())
  .then(data => {
    setMedia(typeof data.media === "number" ? data.media : null);
    setMediaLoaded(true);
  })
  .catch(() => {
    setMedia(null);
    setMediaLoaded(true);
  });

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

async function salvarResultado() {
if (!user) return;
const nowISO = new Date().toISOString();
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
created_at: nowISO
}),
});
} catch (err) { console.error("Erro ao salvar resultado:", err); }
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
if (!finished || !mediaLoaded) return;
if (media === null) setComparisonText("Primeiro teste — ainda sem média!");
else if (wpm > media + 3) setComparisonText("Excelente! Você ficou ACIMA da sua média!");
else if (wpm < media - 3) setComparisonText("Você ficou ABAIXO da sua média. Continue praticando!");
else setComparisonText("Você ficou NA MÉDIA. Consistência importa!");
}, [media, mediaLoaded, finished, wpm]);

const wpmColor = wpm < 10 ? "text-red-600" : wpm < 20 ? "text-yellow-500" : wpm < 30 ? "text-blue-600" : "text-green-800";
const accuracyColor = accuracy < 70 ? "text-red-600" : accuracy < 90 ? "text-yellow-500" : "text-green-600";

if (!user) return <p>Carregando...</p>;

return ( <div className="min-h-screen flex flex-col bg-gray-400">

  {/* Top bar fixa */}
  {!finished && (
    <div className="sticky top-0 bg-gray-800 text-white z-10 p-6 rounded-b-lg shadow-md">
      <h1 className="text-2xl font-bold mb-3 text-center">Teste de Digitação - 3 Minutos</h1>
      <div className="flex justify-center flex-wrap gap-5 text-lg font-semibold">
        <p><b>Tempo:</b> {timeLeft}s</p>
        <p><b>WPM:</b> <span className={wpmColor}>{wpm}</span></p>
        <p><b>Precisão:</b> <span className={accuracyColor}>{accuracy}%</span></p>
        <p><b>Digitado:</b> {totalTyped}</p>
      </div>
    </div>
  )}

  {/* Barra de progresso */}
  {!finished && (
    <div className="w-full h-3 bg-gray-300">
      <div className="h-full bg-green-500 transition-all" style={{ width: `${(pos / text.length) * 100}%` }} />
    </div>
  )}

  {/* Área de digitação fullscreen */}
  {!finished ? (
    <div
      onClick={() => inputRef.current.focus()}
      className="flex-1 w-full p-6 bg-gray-900 font-mono text-lg text-gray-300 leading-relaxed cursor-text overflow-y-auto"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      {text.split("").map((ch, i) => {
        const isCursor = i === pos;
        const colorClass = states[i] === "correct" ? "text-green-400" : states[i] === "wrong" ? "text-red-400 font-bold" : "text-gray-500";
        return (
          <span
            key={i}
            ref={el => (charRefs.current[i] = el)}
            className={`${colorClass} ${isCursor ? "bg-yellow-300 border-b-2 border-black animate-blink" : ""}`}
          >
            {ch}
          </span>
        );
      })}
    </div>
  ) : (
    <div className="flex-1 flex flex-col justify-center items-center bg-gray-900 text-white p-10">
      <h2 className="text-3xl font-bold mb-4">Tempo Encerrado!</h2>
      <p className={`text-2xl mb-2 ${wpmColor}`}>WPM: <b>{animatedWPM}</b></p>
      <p className={`text-2xl mb-2 ${accuracyColor}`}>Precisão: <b>{animatedAccuracy}%</b></p>
      <p className="mt-6 text-lg font-bold">{comparisonText}</p>
      <p className="mt-4 text-gray-400 text-lg">Redirecionando em {redirectCounter}...</p>
    </div>
  )}

  <input ref={inputRef} onKeyDown={handleKey} className="opacity-0 absolute pointer-events-none" />

  <style jsx>{`
    @keyframes blink { 50% { border-color: transparent; } }
    .animate-blink { animation: blink 1s step-start infinite; }
  `}</style>
</div>
);
}
