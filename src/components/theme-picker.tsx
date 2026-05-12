import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Palette } from "lucide-react"
import { THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes"

type Props = {
  value: ThemeKey
  onChange: (key: ThemeKey) => void
  dark: boolean
}

export function ThemePicker({ value, onChange, dark }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Pick accent color"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-lg transition-colors"
        style={{
          background: open ? "var(--cipher-accent-soft)" : "transparent",
          border: "1px solid transparent",
          color: "var(--cipher-muted)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--cipher-accent-soft)"
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent"
        }}
      >
        <Palette className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-40 mt-2 origin-top-right rounded-xl p-2 shadow-xl"
            style={{
              background: "var(--cipher-card)",
              border: "1px solid var(--cipher-line)",
              width: 268,
            }}
          >
            <div
              className="px-2 pt-1 pb-2 font-mono text-[10px] tracking-[0.15em] uppercase"
              style={{ color: "var(--cipher-muted)" }}
            >
              Theme
            </div>
            <div className="grid grid-cols-2 gap-1">
              {THEME_KEYS.map((k) => {
                const t = THEMES[k]
                const palette = dark ? t.dark : t.light
                const active = k === value
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onChange(k)
                    }}
                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
                    style={{
                      background: active
                        ? "var(--cipher-accent-soft)"
                        : "transparent",
                      border: `1px solid ${
                        active ? "var(--cipher-accent)" : "transparent"
                      }`,
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.background =
                          "var(--cipher-bg-2)"
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.background = "transparent"
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
        style={{
          left: 0,
          top: 0,
          width: "50%",
          height: "100%",
          background: accent,
        }}
      />
      <span
        className="absolute"
        style={{
          right: 0,
          top: 0,
          width: "50%",
          height: "50%",
          background: accent2,
        }}
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
