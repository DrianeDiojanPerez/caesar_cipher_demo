import { Check, Palette } from "lucide-react"
import { THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

type Props = {
  value: ThemeKey
  onChange: (key: ThemeKey) => void
  dark: boolean
}

export function ThemePicker({ value, onChange, dark }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Pick accent color"
            style={{ color: "var(--cipher-muted)" }}
          />
        }
      >
        <Palette className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[268px] gap-0 p-2"
        style={{
          background: "var(--cipher-card)",
          borderColor: "var(--cipher-line)",
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
              <Button
                key={k}
                variant="ghost"
                size="sm"
                aria-pressed={active}
                onClick={() => onChange(k)}
                className="group h-auto justify-start gap-2 px-2 py-1.5 text-left"
                style={{
                  background: active
                    ? "var(--cipher-accent-soft)"
                    : "transparent",
                  border: `1px solid ${active ? "var(--cipher-accent)" : "transparent"}`,
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
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
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
