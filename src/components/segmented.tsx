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
    <div
      className="relative inline-flex rounded-xl p-1"
      style={{
        background: "var(--cipher-accent-soft)",
        border: "1px solid var(--cipher-line)",
      }}
    >
      <div
        aria-hidden
        className="absolute top-1 bottom-1 rounded-lg shadow-md"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          left: `calc(${idx} * (100% - 8px) / ${options.length} + 4px)`,
          transition: "left 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          background: "var(--cipher-accent)",
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative z-10 h-9 rounded-lg px-5 text-sm font-semibold transition-colors"
            style={{ color: active ? "#ffffff" : "var(--cipher-muted)" }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
