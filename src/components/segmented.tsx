import { Button } from "@/components/ui/button"

type Option<T extends string> = { value: T; label: string }

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<Option<T>>
}) {
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  return (
    <div className="relative inline-flex rounded-lg p-0.5">
      <div
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded-md"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          left: `calc(${idx} * (100% - 4px) / ${options.length} + 2px)`,
          transition: "left 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          background: "var(--cipher-accent-soft)",
          border: "1px solid var(--cipher-line)",
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <Button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            variant="ghost"
            className="relative z-10 h-8 rounded-md px-3 text-xs font-semibold hover:bg-transparent dark:hover:bg-transparent"
            style={{
              color: active
                ? "var(--cipher-accent)"
                : "var(--cipher-muted)",
            }}
            onMouseEnter={(e) => {
              if (!active)
                e.currentTarget.style.color = "var(--cipher-ink)"
            }}
            onMouseLeave={(e) => {
              if (!active)
                e.currentTarget.style.color = "var(--cipher-muted)"
            }}
          >
            {opt.label}
          </Button>
        )
      })}
    </div>
  )
}
