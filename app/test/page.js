"use client";

import { useEffect, useState, useRef } from "react";
import { generateRandomText } from "@/lib/textGenerator";

export default function TestePage() {
  const [text, setText] = useState("");
  const [pos, setPos] = useState(0);
  const [states, setStates] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  const inputRef = useRef(null);

  // métricas ao vivo
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    loadInitialText();
  }, []);

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

    const key = e.key;

    if (key.length !== 1) return; // ignora ctrl, shift, setas etc

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

  // cronômetro
  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      alert("Tempo acabou!");
      return;
    }

    const i = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(i);
  }, [started, timeLeft]);

  // métricas LIVE
  const totalTyped = correctCount + wrongCount;
  const accuracy = totalTyped > 0 ? ((correctCount / totalTyped) * 100).toFixed(1) : 100;
  const elapsed = 180 - timeLeft;
  const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;

  // barra de progresso (baseada no texto atual percorrido)
  const progress = ((pos / text.length) * 100).toFixed(2);

  // palavra atual destacada
  const words = text.split(" ");
  const currentWordIndex = text.slice(0, pos).split(" ").length - 1;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>
        Teste de Digitação - 3 Minutos
      </h1>

      {/* METRICS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <p><b>Tempo:</b> {timeLeft}s</p>
        <p><b>WPM:</b> {wpm}</p>
        <p><b>Precisão:</b> {accuracy}%</p>
        <p><b>Digitado:</b> {totalTyped}</p>
      </div>

      {/* PALAVRA ATUAL */}
      <div style={{ marginBottom: 15 }}>
        <b>Palavra atual:</b>{" "}
        <span style={{ background: "#ffee99", padding: "4px 8px", borderRadius: 4 }}>
          {words[currentWordIndex] || ""}
        </span>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#ccc",
          borderRadius: 4,
          marginBottom: 20
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#4a90e2",
            transition: "width 0.15s"
          }}
        />
      </div>

      {/* ÁREA DO TEXTO */}
      <div
        onClick={() => inputRef.current.focus()}
        style={{
          padding: 20,
          border: "1px solid #999",
          minHeight: 260,
          fontFamily: "monospace",
          cursor: "text",
          whiteSpace: "pre-wrap",
          lineHeight: "1.6"
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

      {/* input invisível */}
      <input
        ref={inputRef}
        autoFocus
        onKeyDown={handleKey}
        style={{
          opacity: 0,
          position: "absolute",
          pointerEvents: "none"
        }}
      />

      {/* cursor animado */}
      <style>
        {`
          @keyframes blink {
            50% { border-color: transparent; }
          }
        `}
      </style>
    </div>
  );
}
