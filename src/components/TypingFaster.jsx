import { useState, useEffect, useRef, useCallback } from "react";
import { TEXTS, KEYBOARD_ROWS } from "./keyboard";
import { getRank, generateCertificatePDF } from "./utils";

function Keyboard({ activeKeys, flashCorrect, flashWrong, show }) {
  if (!show) return null;
  return (
    <div className="kb-rows">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {row.map((k, ki) => {
            const isActive = activeKeys.has(k.c);
            const isCorrect = flashCorrect.has(k.c);
            const isWrong = flashWrong.has(k.c);
            let cls = `key${k.w ? " " + k.w : ""}`;
            if (isActive) cls += " active";
            else if (isCorrect) cls += " correct-flash";
            else if (isWrong) cls += " wrong-flash";
            return (
              <div key={ki} className={cls}>
                {!k.sp && k.s && <span className="top">{k.s}</span>}
                <span>{k.l}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
function TimerArc({ timeLeft, totalTime }) {
  const r = 26,
    circ = 2 * Math.PI * r;
  const pct = timeLeft / totalTime;
  const dash = circ * pct;
  const color =
    timeLeft <= 10 ? "#f87171" : timeLeft <= 20 ? "#fbbf24" : "#7c6ef5";
  return (
    <div className="timer-wrap">
      <svg className="timer-svg" width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#2a2a3d"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .3s ease,stroke .3s" }}
        />
      </svg>
      <div className="timer-text" style={{ color }}>
        {timeLeft}
      </div>
    </div>
  );
}
function App() {
  const [phase, setPhase] = useState("idle"); // idle | countdown | running | done
  const [countdown, setCountdown] = useState(3);
  const [selectedTime, setSelectedTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [text] = useState(
    () => TEXTS[Math.floor(Math.random() * TEXTS.length)],
  );
  const [typed, setTyped] = useState("");
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [flashCorrect, setFlashCorrect] = useState(new Set());
  const [flashWrong, setFlashWrong] = useState(new Set());
  const [showKb, setShowKb] = useState(true);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const countRef = useRef(null);

  const wpm =
    phase === "done" || phase === "running"
      ? Math.round(
          typed.replace(/\s/g, "").length /
            5 /
            ((selectedTime - timeLeft || 1) / 60),
        )
      : 0;

  const correct = typed.split("").filter((c, i) => c === text[i]).length;
  const accuracy =
    typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  const progress = Math.min((typed.length / text.length) * 100, 100);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    setTyped("");
    setTimeLeft(selectedTime);
    let c = 3;
    countRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countRef.current);
        setPhase("running");
        inputRef.current?.focus();
      }
    }, 1000);
  }, [selectedTime]);

  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPhase("done");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && typed.length >= text.length) {
      clearInterval(timerRef.current);
      setPhase("done");
    }
  }, [typed, text, phase]);

  const handleInput = (e) => {
    if (phase !== "running") return;
    const val = e.target.value;
    if (val.length > text.length) return;
    setTyped(val);
  };

  useEffect(() => {
    const down = (e) => {
      if (e.ctrlKey || e.metaKey) return;
      const code = e.code;
      setActiveKeys((prev) => new Set([...prev, code]));
      if (phase !== "running") return;
      const ch = e.key;
      if (ch.length === 1) {
        const idx = typed.length;
        const expected = text[idx];
        if (ch === expected) {
          setFlashCorrect((prev) => {
            const s = new Set([...prev, code]);
            setTimeout(
              () =>
                setFlashCorrect((p) => {
                  const n = new Set(p);
                  n.delete(code);
                  return n;
                }),
              200,
            );
            return s;
          });
        } else {
          setFlashWrong((prev) => {
            const s = new Set([...prev, code]);
            setTimeout(
              () =>
                setFlashWrong((p) => {
                  const n = new Set(p);
                  n.delete(code);
                  return n;
                }),
              200,
            );
            return s;
          });
        }
      }
    };
    const up = (e) => {
      setActiveKeys((prev) => {
        const s = new Set(prev);
        s.delete(e.code);
        return s;
      });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase, typed, text]);

  const reset = () => {
    clearInterval(timerRef.current);
    clearInterval(countRef.current);
    setPhase("idle");
    setTyped("");
    setTimeLeft(selectedTime);
    setActiveKeys(new Set());
    setFlashCorrect(new Set());
    setFlashWrong(new Set());
  };

  const { rank, label } = getRank(wpm);
  const now = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const renderChars = () =>
    text.split("").map((ch, i) => {
      let cls = "char pending";
      if (i < typed.length)
        cls = `char ${typed[i] === ch ? "correct" : "wrong"}`;
      else if (i === typed.length) cls = "char current";
      return (
        <span key={i} className={cls}>
          {ch}
        </span>
      );
    });

  const wpmColor =
    wpm >= 60 ? "green" : wpm >= 40 ? "amber" : wpm > 0 ? "purple" : "";

  return (
    <div>
      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="countdown-overlay">
          <div className="countdown-number" key={countdown}>
            {countdown || "VIA!"}
          </div>
        </div>
      )}

      <div className="header">
        <div className="logo">
          Typer<span>Fast</span>
        </div>
        <span className="badge">TEST DI VELOCITÀ</span>
      </div>

      <div className="main animate-in">
        {phase !== "done" && (
          <>
            <div className="hero">
              <h1>
                Quanto sei <em>veloce</em>?
              </h1>
              <p>
                Misura la tua velocità di digitazione e ottieni il certificato
              </p>
            </div>

            {/* Time selector */}
            <div className="time-select">
              {[30, 60, 90, 120].map((t) => (
                <button
                  key={t}
                  className={`time-btn${selectedTime === t ? " selected" : ""}`}
                  onClick={() => {
                    if (phase === "idle") {
                      setSelectedTime(t);
                      setTimeLeft(t);
                    }
                  }}
                  disabled={phase === "running"}
                >
                  {t}s
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="stats-bar">
              <div
                className={`stat-card${phase === "running" ? " active" : ""}`}
              >
                <div className="stat-label">⏱ Tempo</div>
                {phase === "running" ? (
                  <TimerArc timeLeft={timeLeft} totalTime={selectedTime} />
                ) : (
                  <div className="stat-value purple">
                    {selectedTime}
                    <span className="stat-unit">sec</span>
                  </div>
                )}
              </div>
              <div className="stat-card">
                <div className="stat-label">⚡ Velocità</div>
                <div className={`stat-value ${wpmColor}`}>
                  {wpm}
                  <span className="stat-unit">WPM</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">✓ Accuratezza</div>
                <div
                  className={`stat-value ${accuracy >= 95 ? "green" : accuracy >= 80 ? "amber" : "red"}`}
                >
                  {accuracy}
                  <span className="stat-unit">%</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">📝 Progresso</div>
                <div className="stat-value purple">
                  {Math.round(progress)}
                  <span className="stat-unit">%</span>
                </div>
              </div>
            </div>

            {/* Text display */}
            <div
              className={`text-display-wrap${phase === "running" ? " running" : ""}`}
            >
              <div className="text-display-header">
                <span className="text-label">Testo da digitare</span>
                <span className="text-label">
                  {typed.length}/{text.length}
                </span>
              </div>
              <div className="progress-bar" style={{ marginBottom: "1rem" }}>
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-body">{renderChars()}</div>
            </div>

            {/* Input */}
            <div className="input-wrap">
              <textarea
                ref={inputRef}
                className="type-input"
                value={typed}
                onChange={handleInput}
                placeholder={
                  phase === "idle"
                    ? 'Clicca "Inizia" per cominciare...'
                    : "Inizia a digitare il testo sopra..."
                }
                disabled={phase !== "running"}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            {/* Controls */}
            <div className="controls">
              {phase === "idle" && (
                <button className="btn btn-primary" onClick={startCountdown}>
                  ▶ Inizia Test
                </button>
              )}
              {phase === "running" && (
                <button className="btn btn-secondary" onClick={reset}>
                  ✕ Abbandona
                </button>
              )}
            </div>

            {/* Keyboard */}
            <div className="keyboard-section">
              <div className="keyboard-header">
                <span className="text-label">🎹 Tastiera Virtuale</span>
                <button
                  className="kb-toggle"
                  onClick={() => setShowKb((v) => !v)}
                >
                  {showKb ? "Nascondi" : "Mostra"}
                </button>
              </div>
              <Keyboard
                activeKeys={activeKeys}
                flashCorrect={flashCorrect}
                flashWrong={flashWrong}
                show={showKb}
              />
            </div>
          </>
        )}

        {/* RESULTS */}
        {phase === "done" && (
          <div className="results-panel animate-in">
            <div className="hero" style={{ marginBottom: "1.5rem" }}>
              <h1>
                🎉 Test <em>Completato!</em>
              </h1>
            </div>

            <span className={`rank-badge rank-${rank}`}>
              Grado {rank} — {label}
            </span>

            <div className="results-grid">
              <div className="result-item">
                <div className="result-item-label">⚡ Velocità</div>
                <div className="result-item-value" style={{ color: "#7c6ef5" }}>
                  {wpm}{" "}
                  <span style={{ fontSize: "1rem", color: "#6b6b85" }}>
                    WPM
                  </span>
                </div>
              </div>
              <div className="result-item">
                <div className="result-item-label">✓ Accuratezza</div>
                <div
                  className="result-item-value"
                  style={{ color: accuracy >= 90 ? "#34d399" : "#fbbf24" }}
                >
                  {accuracy}
                  <span style={{ fontSize: "1rem", color: "#6b6b85" }}>%</span>
                </div>
              </div>
              <div className="result-item">
                <div className="result-item-label">⏱ Tempo usato</div>
                <div className="result-item-value" style={{ color: "#c084fc" }}>
                  {selectedTime - timeLeft}
                  <span style={{ fontSize: "1rem", color: "#6b6b85" }}>
                    {" "}
                    sec
                  </span>
                </div>
              </div>
              <div className="result-item">
                <div className="result-item-label">🔤 Caratteri</div>
                <div className="result-item-value" style={{ color: "#34d399" }}>
                  {correct}
                  <span style={{ fontSize: "1rem", color: "#6b6b85" }}>
                    /{typed.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="name-input-wrap">
              <label>Il tuo nome per il certificato</label>
              <input
                className="name-input"
                type="text"
                placeholder="Inserisci il tuo nome..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="controls" style={{ marginBottom: "1rem" }}>
              <button
                className="btn btn-primary"
                onClick={() =>
                  generateCertificatePDF(
                    name,
                    wpm,
                    accuracy,
                    selectedTime - timeLeft,
                    rank,
                    now,
                  )
                }
              >
                📄 Scarica Certificato PDF
              </button>
              <button className="btn btn-secondary" onClick={reset}>
                ↺ Riprova
              </button>
            </div>

            <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
              Il certificato viene generato nel browser e scaricato
              automaticamente
            </p>
          </div>
        )}
      </div>

      <div className="footer">
        TypeMaster &copy; {new Date().getFullYear()} — Test di velocità di
        digitazione
      </div>
    </div>
  );
}

export default function TypingFaster() {
  return <App />;
}
