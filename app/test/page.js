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

const inputRef = useRef(null);
const textContainerRef = useRef(null);
const charRefs = useRef([]);
const initialScrollDone = useRef(false);

const [correctCount, setCorrectCount] = useState(0);
const [wrongCount, setWrongCount] = useState(0);

const [animatedWPM, setAnimatedWPM] = useState(0);
const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

const [user, setUser] = useState(null);

// Carrega usuário logado e força topo na abertura
useEffect(() => {
window.scrollTo(0, 0); // garante topo na abertura
const u = localStorage.getItem("jdc-user");
if (!u) return router.push("/auth");
setUser(JSON.parse(u));

setTimeout(() => {
  if (inputRef.current) inputRef.current.focus();
}, 100);

}, [router]);

useEffect(() => {
loadInitialText();
}, []);

useEffect(() => {
if (!initialScrollDone.current) {
window.scrollTo(0, 0);
initialScrollDone.current = true;
}

if (charRefs.current[pos]) {
  charRefs.current[pos].scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}

}, [pos]);

function loadInitialText() {
const t = generateRandomText(200);
setText(t);
setStates(new Array(t.length).fill("pending"));
}

function maybeExtendText() {
if (pos < text.length - 200) return;

const extra = generateRandomText(300);
setText(prev => prev + " " + extra);
setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);

}

function handleKey(e) {
if (!started) setStarted(true);
e.preventDefault();

const key = e.key;
if (key.length !== 1) return;

const expected = text[pos];

setStates(old => {
  const updated = [...old];
  updated[pos] = expected === key ? "correct" : "wrong";
  return updated;
});

if (expected === key) setCorrectCount(c => c + 1);
else setWrongCount(w => w + 1);

setPos(pos + 1);
maybeExtendText();

}

const totalTyped = correctCount + wrongCount;
const accuracy = totalTyped > 0 ? ((correctCount / totalTyped) * 100).toFixed(1) : 100;
const elapsed = 180 - timeLeft;
const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;
const progress = ((pos / text.length) * 100).toFixed(2);

function animateResults() {
let wpmCount = 0;
let accCount = 0;

const wpmInterval = setInterval(() => {
  if (wpmCount < wpm) setAnimatedWPM(prev => prev + 1);
  else clearInterval(wpmInterval);
}, 20);

const accInterval = setInterval(() => {
  if (accCount < accuracy) setAnimatedAccuracy(prev => prev + 1);
  else clearInterval(accInterval);
}, 15);

}

async function salvarResultado() {
if (!user) return;

try {
  const res = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: user.id,
      username: user.username,
      turma: user.turma,
      wpm,
      accuracy,
      tempo_segundos: 180,
    }),
  });

  const data = await res.json();
  if (!data.success) console.error("Erro ao salvar resultado:", data.error);
} catch (err) {
  console.error("Erro ao salvar resultado:", err);
}

}

// Timer
useEffect(() => {
if (!started || finished) return;

if (timeLeft <= 0) {
  setFinished(true);
  salvarResultado();
  animateResults();
  setTimeout(() => router.push("/dashboard"), 4000);
  return;
}

const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
return () => clearInterval(i);

}, [started, timeLeft, finished, router]);

const wpmColor = wpm < 30 ? "#F44336" : wpm < 60 ? "#FFC107" : "#4CAF50";
const accuracyColor = accuracy < 70 ? "#F44336" : accuracy < 90 ? "#FF9800" : "#4CAF50";
const progressColor = correctCount / totalTyped > 0.9 ? "#4CAF50" : correctCount / totalTyped > 0.7 ? "#FFC107" : "#F44336";

if (!user) return <p>Carregando...</p>;

return (
<div style={{ padding: 40, fontFamily: "sans-serif" }}>
{/* HEADER FIXO */}
<div style={{
position: "sticky",
top: 0,
background: "#222",
color: "#fff",
zIndex: 10,
padding: "20px 40px",
boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
}}>
<h1 style={{ fontSize: 28, marginBottom: 10 }}>Teste de Digitação - 3 Minutos</h1>
<div style={{ display: "flex", gap: 20, marginBottom: 20 }}> <p><b>Tempo:</b> {timeLeft}s</p> <p><b>WPM:</b> <span style={{ color: wpmColor }}>{wpm}</span></p> <p><b>Precisão:</b> <span style={{ color: accuracyColor }}>{accuracy}%</span></p> <p><b>Digitado:</b> {totalTyped}</p> </div> </div>

  {!finished ? (
    <>
      <div style={{ width: "100%", height: 12, background: "#ccc", borderRadius: 4, marginBottom: 20 }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: progressColor,
          transition: "width 0.15s, background 0.3s"
        }} />
      </div>

      <div
        ref={textContainerRef}
        onClick={() => inputRef.current.focus()}
        style={{
          padding: 20,
          border: "1px solid #999",
          minHeight: 260,
          fontFamily: "monospace",
          cursor: "text",
          whiteSpace: "pre-wrap",
          lineHeight: "1.8",
          overflowY: "auto",
          fontSize: 20
        }}
      >
        {text.split("").map((ch, i) => {
          let color = "#555";
          if (states[i] === "correct") color = "green";
          if (states[i] === "wrong") color = "red";
          const isCursor = i === pos;

          return (
            <span
              key={i}
              ref={el => (charRefs.current[i] = el)}
              style={{
                background: isCursor ? "#ffeb3b" : "none",
                borderBottom: isCursor ? "2px solid black" : "none",
                animation: isCursor ? "blink 1s step-start 0s infinite" : "none",
                color
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        autoFocus
        onKeyDown={handleKey}
        style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
      />
    </>
  ) : (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      animation: "fadeIn 1s ease-in-out"
    }}>
      <p>Tempo encerrado!</p>
      <p style={{ color: wpmColor }}>WPM: {animatedWPM}</p>
      <p style={{ color: accuracyColor }}>Precisão: {animatedAccuracy}%</p>
      <p>Redirecionando para o Dashboard...</p>
    </div>
  )}

  <style>{`
    @keyframes blink { 50% { border-color: transparent; } }
    @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  `}</style>
</div>

);
}
