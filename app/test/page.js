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
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState(null);
  const [redirectCounter, setRedirectCounter] = useState(10);

  const inputRef = useRef(null);
  const charRefs = useRef([]);

  const [MascoteAtual, setMascoteAtual] = useState(MascoteFeliz);
  const [MascoteFade, setMascoteFade] = useState(true);
  const [MascoteAnim, setMascoteAnim] = useState("");

  /* =========================
     CARREGA USUÁRIO
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem("jdc-user");
    if (!stored) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  /* =========================
     CARREGA MÉDIA DO USUÁRIO
  ========================= */

  useEffect(() => {
    if (!user) return;

    async function loadMedia() {
      try {
        const res = await fetch("/api/results/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "pessoal",
            usuario_id: user.usuario_id,
          }),
        });

        const data = await res.json();

        if (data.success && data.data.length > 0) {
          const soma = data.data.reduce((acc, r) => acc + r.wpm, 0);
          setMedia(Math.round(soma / data.data.length));
        } else {
          setMedia(null);
        }
      } catch (err) {
        console.error(err);
        setMedia(null);
      }
    }

    loadMedia();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user]);

  /* =========================
     GERA TEXTO INICIAL
  ========================= */

  useEffect(() => {
    const t = generateRandomText(200);
    setText(t);
    setStates(new Array(t.length).fill("pending"));
  }, []);

  /* =========================
     SCROLL CURSOR
  ========================= */

  useEffect(() => {
    if (charRefs.current[pos])
      charRefs.current[pos].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [pos]);

  /* =========================
     EXTENDE TEXTO
  ========================= */

  function maybeExtendText() {
    if (pos < text.length - 200) return;

    const extra = generateRandomText(300);
    setText(prev => prev + " " + extra);
    setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);
  }

  /* =========================
     DIGITAÇÃO
  ========================= */

  function handleKey(e) {
    const key = e.key;

    if (key === "Backspace") {
      setErrorMessage(
        "Não tente apagar o passado. Cada tecla errada é um passo para a frente."
      );
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

    expected === key
      ? setCorrectCount(c => c + 1)
      : setWrongCount(w => w + 1);

    setPos(pos + 1);
    maybeExtendText();
  }

  /* =========================
     ESTATÍSTICAS
  ========================= */

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

  /* =========================
     MASCOTE
  ========================= */

  useEffect(() => {
    if (media === null || finished) return;

    let novoMascote = MascoteFeliz;
    let anim = "";
    const diff = wpm - media;

    if (diff < -5) {
      novoMascote = MascoteRaiva;
      anim = "shake";
    } else if (diff < 0) {
      novoMascote = MascoteTriste;
      anim = "tilt";
    } else {
      novoMascote = MascoteFeliz;
      anim = "bounce";
    }

    setMascoteFade(false);

    setTimeout(() => {
      setMascoteAtual(novoMascote);
      setMascoteFade(true);
      setMascoteAnim(anim);
    }, 200);
  }, [wpm, media, finished]);

  /* =========================
     SALVAR RESULTADO
  ========================= */

  async function salvarResultado() {
    if (!user) return;

    try {
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
    } catch (err) {
      console.error(err);
    }
  }

  /* =========================
     CONTAGEM REGRESSIVA
  ========================= */

  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      finalizarTeste();
      return;
    }

    const i = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(i);
  }, [started, timeLeft, finished]);

  function finalizarTeste() {
    setFinished(true);
    salvarResultado();

    const c = setInterval(() => {
      setRedirectCounter(t => {
        if (t <= 1) {
          clearInterval(c);
          router.push("/dashboard");
        }
        return t - 1;
      });
    }, 1000);
  }

  if (!user) return <p className="text-center mt-10">Carregando...</p>;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 px-4 py-6">
      <div className="w-full max-w-5xl bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <p>Tempo restante: <b>{timeLeft}s</b></p>
        <p>WPM: <b>{wpm}</b></p>
        {media !== null && <p>Média: <b>{media}</b></p>}
        <p>Precisão: <b>{accuracy}%</b></p>
      </div>

      <div
        onClick={() => inputRef.current.focus()}
        className="flex-1 p-6 overflow-y-auto bg-gray-800 rounded-lg font-mono text-gray-300 text-lg leading-relaxed cursor-text min-h-[60vh] max-w-5xl w-full"
      >
        {text.split("").map((ch, i) => {
          const colorClass =
            states[i] === "correct"
              ? "text-green-400"
              : states[i] === "wrong"
              ? "text-red-400"
              : "";
          return (
            <span key={i} ref={el => (charRefs.current[i] = el)} className={colorClass}>
              {ch}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        onKeyDown={handleKey}
        className="opacity-0 absolute pointer-events-none"
      />
    </div>
  );
}
