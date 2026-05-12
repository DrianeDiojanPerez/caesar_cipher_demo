import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  applyTheme,
  DEFAULT_THEME,
  THEMES,
  type ThemeKey,
} from "@/lib/themes"

export const Route = createFileRoute("/")({ component: App })

type Mode = "encode" | "decode"

function App() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME)
  const [showOnboard, setShowOnboard] = useState(false)

  useEffect(() => {
    const savedDark = localStorage.getItem("caesar.dark")
    setDark(
      savedDark != null
        ? savedDark === "1"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    )
    const savedTheme = localStorage.getItem("caesar.theme")
    if (savedTheme && savedTheme in THEMES) setTheme(savedTheme as ThemeKey)
    setShowOnboard(!localStorage.getItem("caesar.onboarded"))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("caesar.dark", dark ? "1" : "0")
  }, [dark, mounted])

  useEffect(() => {
    if (!mounted) return
    applyTheme(theme, dark)
    localStorage.setItem("caesar.theme", theme)
  }, [theme, dark, mounted])
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
    const cipher = p.get("c")
    const defaultShift = cipher != null ? 0 : 3
    return {
      text: cipher ?? "Meet me at the old oak at midnight.",
      shift: Math.max(
        0,
        Math.min(25, parseInt(p.get("s") ?? String(defaultShift), 10) || 0),
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
            <Button
              onClick={() => setGameOpen(true)}
              size="sm"
              className="h-9 rounded-lg px-3 text-xs font-semibold text-white"
              style={{ background: "var(--cipher-accent)" }}
            >
              <Trophy className="h-3.5 w-3.5" /> Play
            </Button>
            <ThemePicker value={theme} onChange={setTheme} dark={dark} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tutorial"
              onClick={() => setShowOnboard(true)}
              style={{ color: "var(--cipher-muted)" }}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setDark((d) => !d)}
              style={{ color: "var(--cipher-muted)" }}
            >
              <Moon
                className="h-4 w-4 dark:hidden"
                style={{ color: "var(--cipher-accent)" }}
              />
              <Sun
                className="hidden h-4 w-4 dark:block"
                style={{ color: "var(--cipher-accent-2)" }}
              />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl space-y-7 px-5 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col items-center gap-3">
          <Segmented<Mode>
            value={mode}
            onChange={(next) => {
              setMode(next)
              if (next === "decode") {
                setText("")
                setShift(0)
              }
            }}
            options={[
              { value: "encode", label: "Encode" },
              { value: "decode", label: "Decode" },
            ]}
          />
          <p
            className="caesar-caption text-xs tracking-[0.12em]"
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
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={
              mode === "encode"
                ? "Type a message to encode…"
                : "Paste a cipher to decode…"
            }
            className="resize-none rounded-xl px-3.5 py-3 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              background: "var(--cipher-card)",
              borderColor: "var(--cipher-line)",
              color: "var(--cipher-ink)",
              fontFamily:
                "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
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
            <Button
              onClick={onCopy}
              variant="outline"
              size="xs"
              style={{
                borderColor: "var(--cipher-line)",
                background: "var(--cipher-card)",
                color: "var(--cipher-ink)",
              }}
            >
              {copied ? (
                <>
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--cipher-accent)" }}
                  />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </Button>
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
          <Button
            onClick={() => setQrOpen(true)}
            disabled={!output.trim()}
            className="h-12 w-full rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--cipher-accent)" }}
          >
            <QrCode className="h-4 w-4" />
            Generate QR code
          </Button>

          <QRPanel
            shift={shift}
            output={output}
            open={qrOpen && !!output.trim()}
            onOpenChange={setQrOpen}
          />
        </section>

        <section className="pt-4 pb-2 text-center">
          <p
            className="caesar-caption text-[11px] tracking-wide"
            style={{ color: "var(--cipher-muted)" }}
          >
            shift 0 = identity · 13 = ROT13 · 25 = inverse-1
          </p>
        </section>
      </main>

      <Onboarding
        open={showOnboard}
        onOpenChange={setShowOnboard}
        onDone={closeOnboard}
      />
      <CipherGame open={gameOpen} onOpenChange={setGameOpen} />
    </div>
  )
}

