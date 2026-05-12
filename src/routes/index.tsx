import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence } from "motion/react"
import {
  Check,
  Copy,
  Moon,
  QrCode,
  RotateCw,
  Sparkles,
  Sun,
  Trophy,
} from "lucide-react"
import { caesar } from "@/lib/caesar"
import { CipherDial } from "@/components/cipher-dial"
import { ScrambleText } from "@/components/scramble-text"
import { QRPanel } from "@/components/qr-panel"
import { Onboarding } from "@/components/onboarding"
import { CipherGame } from "@/components/cipher-game"
import { Segmented } from "@/components/segmented"
import { ThemePicker } from "@/components/theme-picker"
import {
  applyTheme,
  DEFAULT_THEME,
  THEMES,
  type ThemeKey,
} from "@/lib/themes"

export const Route = createFileRoute("/")({ component: App })

type Mode = "encode" | "decode"

function App() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem("caesar.dark")
    if (saved != null) return saved === "1"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("caesar.dark", dark ? "1" : "0")
  }, [dark])

  const [theme, setTheme] = useState<ThemeKey>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME
    const saved = localStorage.getItem("caesar.theme")
    if (saved && saved in THEMES) return saved as ThemeKey
    return DEFAULT_THEME
  })

  useEffect(() => {
    applyTheme(theme, dark)
    localStorage.setItem("caesar.theme", theme)
  }, [theme, dark])

  const [showOnboard, setShowOnboard] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return !localStorage.getItem("caesar.onboarded")
  })
  const closeOnboard = () => {
    localStorage.setItem("caesar.onboarded", "1")
    setShowOnboard(false)
  }

  const initial = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        text: "Meet me at the old oak at midnight.",
        shift: 3,
        mode: "encode" as Mode,
      }
    }
    const p = new URLSearchParams(location.search)
    return {
      text: p.get("c") ?? "Meet me at the old oak at midnight.",
      shift: Math.max(
        0,
        Math.min(25, parseInt(p.get("s") ?? "3", 10) || 0),
      ),
      mode: (p.get("m") === "decode" ? "decode" : "encode") as Mode,
    }
  }, [])

  const [mode, setMode] = useState<Mode>(initial.mode)
  const [shift, setShift] = useState(initial.shift)
  const [text, setText] = useState(initial.text)
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)

  const output = useMemo(
    () => caesar(text, shift, mode === "decode"),
    [text, shift, mode],
  )

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && location.search) {
      const u = new URL(location.href)
      u.search = ""
      history.replaceState(null, "", u.toString())
    }
  }, [])

  return (
    <div
      className="relative min-h-screen"
      style={{ color: "var(--cipher-ink)", background: "var(--cipher-bg)" }}
    >
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b3" />
      </div>

      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          background:
            "color-mix(in oklab, var(--cipher-bg) 75%, transparent)",
          borderBottom: "1px solid var(--cipher-line)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg shadow-sm"
              style={{ background: "var(--cipher-accent)" }}
            >
              <RotateCw
                className="h-4 w-4 text-white"
                strokeWidth={2.2}
              />
            </div>
            <div>
              <div
                className="text-sm leading-none font-bold tracking-tight"
                style={{ color: "var(--cipher-ink)" }}
              >
                Caesar
              </div>
              <div
                className="mt-0.5 font-mono text-[10px] leading-none"
                style={{ color: "var(--cipher-muted)" }}
              >
                rotary cipher
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGameOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-colors"
              style={{ background: "var(--cipher-accent)" }}
            >
              <Trophy className="h-3.5 w-3.5" /> Play
            </button>
            <ThemePicker value={theme} onChange={setTheme} dark={dark} />
            <IconBtn
              label="Tutorial"
              onClick={() => setShowOnboard(true)}
            >
              <Sparkles className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              label="Toggle theme"
              onClick={() => setDark((d) => !d)}
            >
              <Moon
                className="h-4 w-4 dark:hidden"
                style={{ color: "var(--cipher-accent)" }}
              />
              <Sun
                className="hidden h-4 w-4 dark:block"
                style={{ color: "var(--cipher-accent-2)" }}
              />
            </IconBtn>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl space-y-7 px-5 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col items-center gap-3">
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { value: "encode", label: "Encode" },
              { value: "decode", label: "Decode" },
            ]}
          />
          <p
            className="font-mono text-xs font-medium tracking-[0.12em]"
            style={{ color: "var(--cipher-muted)" }}
          >
            {mode === "encode" ? "PLAINTEXT  →  CIPHER" : "CIPHER  →  PLAINTEXT"}
          </p>
        </section>

        <section className="flex flex-col items-center">
          <CipherDial shift={shift} setShift={setShift} />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="font-mono text-xs tracking-wider uppercase"
              style={{ color: "var(--cipher-muted)" }}
            >
              {mode === "encode" ? "Plaintext" : "Ciphertext"}
            </label>
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--cipher-muted)" }}
            >
              {text.length} chars
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={
              mode === "encode"
                ? "Type a message to encode…"
                : "Paste a cipher to decode…"
            }
            className="w-full resize-none rounded-xl px-3.5 py-3 text-[15px] leading-relaxed focus:outline-none"
            style={{
              background: "var(--cipher-card)",
              border: "1px solid var(--cipher-line)",
              color: "var(--cipher-ink)",
              fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
            }}
          />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="font-mono text-xs tracking-wider uppercase"
              style={{ color: "var(--cipher-muted)" }}
            >
              {mode === "encode" ? "Ciphertext" : "Plaintext"}
              <span
                className="ml-2 tracking-normal normal-case"
                style={{ color: "var(--cipher-accent)" }}
              >
                · shift {shift}
              </span>
            </label>
            <button
              onClick={onCopy}
              className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition"
              style={{
                border: "1px solid var(--cipher-line)",
                background: "var(--cipher-card)",
                color: "var(--cipher-ink)",
              }}
            >
              {copied ? (
                <>
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--cipher-accent)" }}
                  />{" "}
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <div
            className="min-h-[88px] rounded-xl px-3.5 py-3 font-mono text-[15px] leading-relaxed break-words whitespace-pre-wrap"
            style={{
              background: "var(--cipher-bg-2)",
              border: "1px solid var(--cipher-line)",
              color: "var(--cipher-ink)",
            }}
          >
            <ScrambleText text={output} />
          </div>
        </section>

        <section>
          <button
            onClick={() => setQrOpen((o) => !o)}
            disabled={!output.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--cipher-accent)" }}
          >
            <QrCode className="h-4 w-4" />
            {qrOpen ? "Hide QR code" : "Generate QR code"}
          </button>

          <AnimatePresence>
            {qrOpen && output.trim() && (
              <QRPanel
                shift={shift}
                output={output}
                onClose={() => setQrOpen(false)}
              />
            )}
          </AnimatePresence>
        </section>

        <section className="pt-4 pb-2 text-center">
          <p
            className="font-mono text-[11px] tracking-wide"
            style={{ color: "var(--cipher-muted)" }}
          >
            shift 0 = identity · 13 = ROT13 · 25 = inverse-1
          </p>
        </section>
      </main>

      <AnimatePresence>
        {showOnboard && <Onboarding onDone={closeOnboard} />}
      </AnimatePresence>
      <AnimatePresence>
        {gameOpen && <CipherGame onClose={() => setGameOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function IconBtn({
  onClick,
  children,
  label,
}: {
  onClick: () => void
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg transition-colors"
      style={{
        background: "transparent",
        border: "1px solid transparent",
        color: "var(--cipher-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--cipher-accent-soft)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
      }}
    >
      {children}
    </button>
  )
}
