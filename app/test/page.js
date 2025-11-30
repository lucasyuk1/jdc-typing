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

  const [redirectCounter, setRedirectCounter] = useState(5);

  // =======================
  // Carregar usuário
  // =======================
  useEffect(() => {
    window.scrollTo(0, 0);

    const u = localStorage.getItem("jdc-user");
    if (!u) return router.push("/auth");

    const parsed = JSON.parse(u);
    setUser(parsed);

    fetch(`/api/userMedia?user_id=${parsed.id}`)
      .then(r => r.json())
      .then(data => setMedia(data.media || null))
      .catch(() => setMedia(null));

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [router]);

  // =======================
  // Gera texto
  // =======================
  useEffect(() => {
    const t = generateRandomText(200);
    setText(t);
    setStates(new Array(t.length).fill("pending"));
  }, []);

  // =======================
  // Cursor scroll
  // =======================
  useEffect(() => {
    if (charRefs.current[pos]) {
      charRefs.current[pos].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [pos]);

  // =======================
  // Extensão do texto
  // =======================
  function maybeExtendText() {
    if (pos < text.length - 200) return;

    const extra = generateRandomText(300);
    setText(prev => prev + " " + extra);
    setStates(prev => [...prev, ...new Array(extra.length + 1).fill("pending")]);
  }

  // =======================
  // Lógica de digitação
  // =======================
  function handleKey(e) {
    const key = e.key;

    // impede backspace e manda frase filosófica
    if (key === "Backspace") {
      setErrorMessage("Não tente apagar o passado. Cada tecla errada é um passo para a frente.");
      return e.preventDefault();
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

    if (expected === key) setCorrectCount(c => c + 1);
    else setWrongCount(w => w + 1);

    setPos(pos + 1);
    maybeExtendText();
  }

  const totalTyped = correctCount + wrongCount;

  const accuracy = totalTyped > 0
    ? Number(((correctCount / totalTyped) * 100).toFixed(1))
    : 100;

  const elapsed = 180 - timeLeft;
  const wpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;

  // =======================
  // Animação do resultado
  // =======================
  function animateResults() {
    let w = 0;
    let a = 0;

    const wi = setInterval(() => {
      w++;
      setAnimatedWPM(w);
      if (w >= wpm) clearInterval(wi);
    }, 20);

    const ai = setInterval(() => {
      a++;
      setAnimatedAccuracy(a);
      if (a >= accuracy) clearInterval(ai);
    }, 15);
  }

  // =======================
  // Salvar resultado
  // =======================
  async function salvarResultado() {
    if (!user) return;

    const nowBR = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

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
          created_at: nowBR
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar resultado:", err);
    }
  }

  // =======================
  // Timer
  // =======================
  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      finalizarTeste();
      return;
    }

    const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [started, timeLeft, finished]);

  // =======================
  // Finalizar
  // =======================
  function finalizarTeste() {
    setFinished(true);
    salvarResultado();
    animateResults();
    gerarMensagemComparativa();

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

  // =======================
  // Mensagem comparativa
  // =======================
  function gerarMensagemComparativa() {
    if (!media) {
      setComparisonText("Primeiro teste — ainda sem média!");
      return;
    }

    if (wpm > media + 3) {
      setComparisonText("Excelente! Você ficou ACIMA da sua média!");
    } else if (wpm < media - 3) {
      setComparisonText("Você ficou ABAIXO da média. Continue treinando!");
    } else {
      setComparisonText("Você ficou NA MÉDIA. Consistência é tudo!");
    }
  }

  const wpmColor = wpm < 30 ? "#F44336" : wpm < 60 ? "#FFC107" : "#4CAF50";
  const accuracyColor = accuracy < 70 ? "#F44336" : accuracy < 90 ? "#FF9800" : "#4CAF50";

  if (!user) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      {!finished && (
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#222",
            color: "#fff",
            zIndex: 10,
            padding: "20px 40px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 10 }}>Teste de Digitação - 3 Minutos</h1>
          <div style={{ display: "flex", gap: 20 }}>
            <p><b>Tempo:</b> {timeLeft}s</p>
            <p><b>WPM:</b> <span style={{ color: wpmColor }}>{wpm}</span></p>
            <p><b>Precisão:</b> <span style={{ color: accuracyColor }}>{accuracy}%</span></p>
            <p><b>Digitado:</b> {totalTyped}</p>
          </div>
        </div>
      )}

      {/* ÁREA DO TEXTO */}
      {!finished ? (
        <>
          {/* barra progresso */}
          <div style={{
            width: "100%",
            height: 12,
            background: "#ccc",
            borderRadius: 4,
            marginBottom: 20
          }}>
            <div style={{
              height: "100%",
              width: `${((pos / text.length) * 100).toFixed(2)}%`,
              background: "#4CAF50",
              transition: "width .15s"
            }} />
          </div>

          {/* mensagem filosófica do backspace */}
          {errorMessage && (
            <p style={{
              color: "#c0392b",
              marginBottom: 15,
              fontStyle: "italic",
              fontWeight: "bold"
            }}>{errorMessage}</p>
          )}

          {/* texto para digitar */}
          <div
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
              fontSize: 20,
              borderRadius: 12
            }}
          >
            {text.split("").map((ch, i) => {
              let color = "#555";
              let fontWeight = "normal";

              if (states[i] === "correct") color = "green";
              if (states[i] === "wrong") {
                color = "red";
                fontWeight = "bold";
              }

              const isCursor = i === pos;

              return (
                <span
                  key={i}
                  ref={el => (charRefs.current[i] = el)}
                  style={{
                    background: isCursor ? "#ffeb3b" : "none",
                    borderBottom: isCursor ? "2px solid black" : "none",
                    animation: isCursor ? "blink 1s step-start infinite" : "none",
                    color,
                    fontWeight
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            onKeyDown={handleKey}
            style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
          />
        </>
      ) : (
        // ======================================
        // CARD FINAL BONITO UI/UX
        // ======================================
        <div
          style={{
            marginTop: 40,
            background: "linear-gradient(135deg, #ffffff, #f1f1f1)",
            padding: 40,
            borderRadius: 24,
            boxShadow: "0px 6px 30px rgba(0,0,0,0.15)",
            width: "90%",
            maxWidth: 600,
            marginInline: "auto",
            textAlign: "center",
            animation: "bounceIn .8s"
          }}
        >
          <h2 style={{ fontSize: 34, marginBottom: 15 }}>Tempo Encerrado!</h2>

          <p style={{ fontSize: 28, color: wpmColor, margin: 8 }}>
            WPM: <b>{animatedWPM}</b>
          </p>

          <p style={{ fontSize: 28, color: accuracyColor, margin: 8 }}>
            Precisão: <b>{animatedAccuracy}%</b>
          </p>

          <p style={{
            marginTop: 25,
            fontSize: 20,
            fontWeight: "bold",
            color: "#333"
          }}>
            {comparisonText}
          </p>

          <p style={{
            marginTop: 30,
            fontSize: 18,
            color: "#666"
          }}>
            Redirecionando em <b>{redirectCounter}</b> segundos...
          </p>

          <button
            onClick={() => router.push("/teste")}
            style={{
              marginTop: 30,
              padding: "15px 38px",
              fontSize: 20,
              borderRadius: 15,
              background: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.2)",
              transition: "0.2s",
            }}
          >
            Refazer Teste
          </button>
        </div>
      )}

      {/* ANIMAÇÕES */}
      <style>{`
        @keyframes blink { 50% { border-color: transparent; } }

        @keyframes bounceIn {
          0% { transform: scale(.6); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
