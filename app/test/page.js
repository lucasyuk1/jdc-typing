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
  const [redirectCounter, setRedirectCounter] = useState(10);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState(null);

  const inputRef = useRef(null);
  const charRefs = useRef([]);

  const [MascoteAtual, setMascoteAtual] = useState(MascoteFeliz);
  const [MascoteAnim, setMascoteAnim] = useState("");

  /* ================= USER ================= */

  useEffect(() => {
    const stored = localStorage.getItem("jdc-user");
    if (!stored) return router.push("/auth");
    setUser(JSON.parse(stored));
  }, [router]);

  /* ================= MÉDIA ================= */

  useEffect(() => {
    if (!user) return;

    async function loadMedia() {
      const res = await fetch("/api/results/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "pessoal", usuario_id: user.usuario_id }),
      });

      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const soma = data.data.reduce((acc, r) => acc + r.wpm, 0);
        setMedia(Math.round(soma / data.data.length));
      }
    }

    loadMedia();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user]);

  /* ================= TEXTO ================= */

  useEffect(() => {
    const t = generateRandomText(200);
    setText(t);
    setStates(new Array(t.length).fill("pending"));
  }, []);

  useEffect(() => {
    if (charRefs.current[pos]) {
      charRefs.current[pos].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [pos]);

  function maybeExtendText() {
    if (pos < text.length - 200) return;
    const extra = generateRandomText(300);
    setText(prev => prev + " " + extra);
    setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);
  }

  function handleKey(e) {
    if (finished) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      return;
    }

    if (!started) setStarted(true);
    e.preventDefault();
    if (e.key.length !== 1) return;

    const expected = text[pos];

    setStates(old => {
      const updated = [...old];
      updated[pos] = expected === e.key ? "correct" : "wrong";
      return updated;
    });

    expected === e.key
      ? setCorrectCount(c => c + 1)
      : setWrongCount(w => w + 1);

    setPos(pos + 1);
    maybeExtendText();
  }

  /* ================= STATS ================= */

  const totalTyped = correctCount + wrongCount;

  const accuracy =
    totalTyped > 0
      ? Number(((correctCount / totalTyped) * 100).toFixed(1))
      : 100;

  const elapsed = 180 - timeLeft;

  const wpm =
    elapsed > 0
      ? Math.round((correctCount / 5) / (elapsed / 60))
      : 0;

  /* ================= MASCOTE ================= */

  useEffect(() => {
    if (media === null || finished) return;

    const diff = wpm - media;

    if (diff < -5) {
      setMascoteAtual(MascoteRaiva);
      setMascoteAnim("shake");
    } else if (diff < 0) {
      setMascoteAtual(MascoteTriste);
      setMascoteAnim("tilt");
    } else {
      setMascoteAtual(MascoteFeliz);
      setMascoteAnim("bounce");
    }
  }, [wpm, media, finished]);

  /* ================= SALVAR ================= */

  async function salvarResultado() {
    if (!user) return;

    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: user.usuario_id,
        username: user.username,
        turma: user.turma,
        wpm,
        accuracy,
        tempo_segundos: 180,
        created_at: new Date().toISOString(),
      }),
    });
  }

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      finalizarTeste();
      return;
    }

    const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [started, timeLeft, finished]);

  async function finalizarTeste() {
    setFinished(true);
    await salvarResultado();

    const interval = setInterval(() => {
      setRedirectCounter(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);
  }

  /* ================= PALAVRA ATUAL ================= */

  function isCurrentWord(index) {
    const before = text.lastIndexOf(" ", pos - 1) + 1;
    const after = text.indexOf(" ", pos);
    const end = after === -1 ? text.length : after;
    return index >= before && index < end;
  }

  if (!user) return null;

  /* ================= TELA FINAL ================= */

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white text-center px-6">
        <Image src={MascoteAtual} width={160} height={160} alt="Mascote" />
        <h1 className="text-4xl font-bold mt-6 mb-4">Teste Finalizado!</h1>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-md space-y-3">
          <p><strong>WPM:</strong> {wpm}</p>
          <p><strong>Precisão:</strong> {accuracy}%</p>
          {media !== null && <p><strong>Sua média:</strong> {media}</p>}
        </div>

        <p className="mt-6 text-gray-400">
          Redirecionando para o dashboard em {redirectCounter}s...
        </p>
      </div>
    );
  }

  /* ================= RENDER NORMAL ================= */

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 px-4 py-6 text-white">

      <div className="w-full max-w-6xl bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 mb-6 flex justify-between items-center gap-6">
        <div className={`transition-all duration-300 ${MascoteAnim}`}>
          <Image src={MascoteAtual} width={140} height={140} alt="Mascote" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center w-full">
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-400">Tempo</p>
            <p className="text-2xl font-bold">{timeLeft}s</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-400">WPM</p>
            <p className="text-2xl font-bold text-blue-400">{wpm}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-400">Média</p>
            <p className="text-2xl font-bold text-purple-400">{media ?? "-"}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-400">Precisão</p>
            <p className="text-2xl font-bold">{accuracy}%</p>
          </div>
        </div>
      </div>

      <div
        onClick={() => inputRef.current.focus()}
        className="w-full max-w-6xl bg-gray-900 p-8 rounded-2xl font-mono text-lg leading-relaxed min-h-[60vh] cursor-text shadow-inner"
      >
        {text.split("").map((ch, i) => {
          const isCursor = i === pos;

          const color =
            states[i] === "correct"
              ? "text-green-400"
              : states[i] === "wrong"
              ? "text-red-500"
              : "text-gray-400";

          const wordHighlight = isCurrentWord(i)
            ? "bg-gray-800/60 rounded"
            : "";

          const cursorStyle = isCursor
            ? "border-l-2 border-blue-400 animate-blink bg-blue-900/40"
            : "";

          return (
            <span
              key={i}
              ref={el => (charRefs.current[i] = el)}
              className={`${color} ${wordHighlight} ${cursorStyle}`}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        onKeyDown={handleKey}
        className="opacity-0 absolute"
      />
    </div>
  );
}
