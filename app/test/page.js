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

  useEffect(() => {
    loadInitialText();
  }, []);

  function loadInitialText() {
    const t = generateRandomText(400);
    setText(t);
    setStates(new Array(t.length).fill("pending"));
  }

  // gera mais texto conforme avança
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

    // ignora teclas especiais
    if (key.length !== 1) return;

    const expected = text[pos];

    setStates(old => {
      const updated = [...old];
      updated[pos] = expected === key ? "correct" : "wrong";
      return updated;
    });

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

  return (
    <div style={{ padding: 40 }}>
      <h1>Teste de Digitação - 3 Minutos</h1>
      <p>Tempo restante: {timeLeft}s</p>

      <div
        onClick={() => inputRef.current.focus()}
        style={{
          padding: 20,
          border: "1px solid #999",
          minHeight: 200,
          fontFamily: "monospace",
          cursor: "text",
          whiteSpace: "pre-wrap"
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
                background: isCursor ? "yellow" : "none",
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
    </div>
  );
}
