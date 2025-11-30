import { useEffect, useState, useRef } from "react";
import { generateRandomText } from "@/lib/textGenerator";

export default function TestePage() {
const [text, setText] = useState("");
const [pos, setPos] = useState(0);
const [states, setStates] = useState([]);
const [started, setStarted] = useState(false);
const [timeLeft, setTimeLeft] = useState(180);

const inputRef = useRef(null);
const textContainerRef = useRef(null);
const charRefs = useRef([]); // ref para cada caractere

const [correctCount, setCorrectCount] = useState(0);
const [wrongCount, setWrongCount] = useState(0);

useEffect(() => {
loadInitialText();
}, []);

useEffect(() => {
// scroll suave do caractere atual para o centro do container
if (charRefs.current[pos]) {
charRefs.current[pos].scrollIntoView({
behavior: "smooth",
block: "center",
inline: "center"
});
}
}, [pos]);

function loadInitialText() {
const t = generateRandomText(400);
setText(t);
setStates(new Array(t.length).fill("pending"));
}

function maybeExtendText() {
if (pos < text.length - 200) return;

const extra = generateRandomText(300);
const newText = text + " " + extra;

setText(newText);
setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);

}

function handleKey(e) {
if (!started) setStarted(true);
e.preventDefault(); // previne scroll padrão

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

useEffect(() => {
if (!started) return;
if (timeLeft <= 0) {
alert("Tempo acabou!");
return;
}

const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
return () => clearInterval(i);

}, [started, timeLeft]);

const totalTyped = correctCount + wrongCount;
const accuracy = totalTyped > 0 ? ((correctCount / totalTyped) * 100).toFixed(1) : 100;
const elapsed = 180 - timeLeft;
const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;

const progress = ((pos / text.length) * 100).toFixed(2);
const words = text.split(" ");
const currentWordIndex = text.slice(0, pos).split(" ").length - 1;

return (
<div style={{ padding: 40, fontFamily: "sans-serif" }}>
<h1 style={{ fontSize: 28, marginBottom: 10 }}>Teste de Digitação - 3 Minutos</h1>

  <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
    <p><b>Tempo:</b> {timeLeft}s</p>
    <p><b>WPM:</b> {wpm}</p>
    <p><b>Precisão:</b> {accuracy}%</p>
    <p><b>Digitado:</b> {totalTyped}</p>
  </div>

  <div style={{ marginBottom: 15 }}>
    <b>Palavra atual:</b>{" "}
    <span style={{ background: "#ffee99", padding: "6px 10px", borderRadius: 4, fontSize: 22 }}>
      {words[currentWordIndex] || ""}
    </span>
  </div>

  <div style={{ width: "100%", height: 8, background: "#ccc", borderRadius: 4, marginBottom: 20 }}>
    <div style={{ height: "100%", width: `${progress}%`, background: "#4a90e2", transition: "width 0.15s" }} />
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

  <style>{`@keyframes blink { 50% { border-color: transparent; } }`}</style>
</div>

);
}
