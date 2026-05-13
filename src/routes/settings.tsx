import { useEffect, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Moon,
  Palette,
  Sparkles,
  Sun,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Onboarding } from "@/components/onboarding"
import {
  applyTheme,
  DEFAULT_THEME,
  THEMES,
  THEME_KEYS,
  type ThemeKey,
} from "@/lib/themes"

export const Route = createFileRoute("/settings")({ component: Settings })

function Settings() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const savedDark = localStorage.getItem("caesar.dark")
    setDark(
      savedDark != null
        ? savedDark === "1"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    )
    const savedTheme = localStorage.getItem("caesar.theme")
    if (savedTheme && savedTheme in THEMES) setTheme(savedTheme as ThemeKey)
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

  const rowClass =
    "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors hover:bg-[var(--cipher-accent-soft)]"

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ color: "var(--cipher-ink)", background: "var(--cipher-bg)" }}
    >
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b3" />
      </div>

      <header className="sticky top-3 z-30 mx-auto w-fit max-w-[calc(100%-1.5rem)] px-3 sm:top-4 sm:px-4">
        <div
          className="flex h-14 items-center gap-2 rounded-full pl-3 pr-5 backdrop-blur-xl shadow-lg"
          style={{
            background:
              "color-mix(in oklab, var(--cipher-bg) 70%, transparent)",
            border: "1px solid var(--cipher-line)",
          }}
        >
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg px-2 text-xs font-medium"
              style={{ color: "var(--cipher-muted)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div
            className="caesar-caption text-xs"
            style={{ color: "var(--cipher-ink)" }}
          >
            Settings
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-md space-y-6 px-5 py-10 sm:px-6">
        <h1
          className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl"
          style={{
            backgroundImage:
              "linear-gradient(120deg, var(--cipher-accent), var(--cipher-accent-2), var(--cipher-accent-3))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Settings
        </h1>

        <section
          className="space-y-1 rounded-2xl p-2 shadow-sm"
          style={{
            background: "var(--cipher-card)",
            border: "1px solid var(--cipher-line)",
          }}
        >
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setThemeOpen((v) => !v)}
              className={rowClass}
              style={{ color: "var(--cipher-ink)" }}
              aria-expanded={themeOpen}
            >
              <Palette
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--cipher-muted)" }}
              />
              <span className="flex-1">Theme</span>
              <span
                className="font-mono text-[11px]"
                style={{ color: "var(--cipher-muted)" }}
              >
                {THEMES[theme].label}
              </span>
              <motion.span
                animate={{ rotate: themeOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--cipher-muted)" }}
                />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {themeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1 px-2 pb-2 pt-1">
                    {THEME_KEYS.map((k) => {
                      const t = THEMES[k]
                      const palette = dark ? t.dark : t.light
                      const active = k === theme
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setTheme(k)}
                          aria-pressed={active}
                          className="flex h-10 items-center gap-2 rounded-lg px-2 text-left"
                          style={{
                            background: active
                              ? "var(--cipher-accent-soft)"
                              : "transparent",
                            border: `1px solid ${active ? "var(--cipher-accent)" : "var(--cipher-line)"}`,
                          }}
                        >
                          <Swatch
                            bg={palette.card}
                            ring={palette.line}
                            accent={palette.accent}
                            accent2={palette.accent2}
                            ink={palette.ink}
                          />
                          <span
                            className="flex-1 truncate text-[12px] font-medium"
                            style={{
                              color: active
                                ? "var(--cipher-accent)"
                                : "var(--cipher-ink)",
                            }}
                          >
                            {t.label}
                          </span>
                          {active && (
                            <Check
                              className="h-3.5 w-3.5 shrink-0"
                              strokeWidth={2.5}
                              style={{ color: "var(--cipher-accent)" }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className={rowClass}
            style={{ color: "var(--cipher-ink)" }}
          >
            <Sparkles
              className="h-4 w-4 shrink-0"
              style={{ color: "var(--cipher-muted)" }}
            />
            <span className="flex-1">Tutorial</span>
            <ChevronRight
              className="h-4 w-4 shrink-0"
              style={{ color: "var(--cipher-muted)" }}
            />
          </button>

          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className={rowClass}
            style={{ color: "var(--cipher-ink)" }}
            role="switch"
            aria-checked={dark}
          >
            {dark ? (
              <Sun
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--cipher-accent-2)" }}
              />
            ) : (
              <Moon
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--cipher-accent)" }}
              />
            )}
            <span className="flex-1">
              {dark ? "Light mode" : "Dark mode"}
            </span>
            <span
              className="relative inline-block h-5 w-9 rounded-full transition-colors"
              style={{
                background: dark
                  ? "var(--cipher-accent)"
                  : "var(--cipher-line)",
              }}
              aria-hidden
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                style={{ left: dark ? "calc(100% - 1.125rem)" : "2px" }}
              />
            </span>
          </button>
        </section>
      </main>

      <Onboarding
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        onDone={() => setTutorialOpen(false)}
      />
    </div>
  )
}

function Swatch({
  bg,
  ring,
  accent,
  accent2,
  ink,
}: {
  bg: string
  ring: string
  accent: string
  accent2: string
  ink: string
}) {
  return (
    <span
      className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full"
      style={{ background: bg, border: `1px solid ${ring}` }}
      aria-hidden="true"
    >
      <span
        className="absolute"
        style={{ left: 0, top: 0, width: "50%", height: "100%", background: accent }}
      />
      <span
        className="absolute"
        style={{ right: 0, top: 0, width: "50%", height: "50%", background: accent2 }}
      />
      <span
        className="absolute"
        style={{
          right: 0,
          bottom: 0,
          width: "50%",
          height: "50%",
          background: ink,
          opacity: 0.85,
        }}
      />
    </span>
  )
}
