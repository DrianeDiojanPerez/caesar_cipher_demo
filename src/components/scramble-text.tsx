import { useEffect, useRef, useState } from "react"

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________"

export function ScrambleText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [display, setDisplay] = useState(text)
  const rafRef = useRef<number | undefined>(undefined)
  const lastText = useRef(text)

  useEffect(() => {
    if (text === lastText.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const from = lastText.current
    const to = text
    lastText.current = to
    const start = performance.now()
    const duration = 240

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const out = to
        .split("")
        .map((ch, i) => {
          if (!/[a-zA-Z]/.test(ch)) return ch
          const reveal = i / Math.max(to.length, 1)
          if (t > reveal + 0.1) return ch
          if (t < reveal - 0.05) return from[i] ?? ch
          return GLYPHS[(Math.random() * GLYPHS.length) | 0]
        })
        .join("")
      setDisplay(out)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else setDisplay(to)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [text])

  return <span className={className}>{display || " "}</span>
}
