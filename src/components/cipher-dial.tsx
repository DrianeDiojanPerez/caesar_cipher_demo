import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { animate, useMotionValue } from "motion/react"
import { ChevronRight } from "lucide-react"
import { ALPHABET, mod } from "@/lib/caesar"
import { Button } from "@/components/ui/button"

type Props = {
  shift: number
  setShift: (s: number) => void
}

// Fixed logical SVG coordinate space — the SVG scales to its container via
// viewBox, so size never depends on JS measuring the viewport. No layout
// jump on first paint.
const SIZE = 320

export function CipherDial({ shift, setShift }: Props) {
  return (
    <div className="flex w-full flex-col items-center">
      <Dial shift={shift} setShift={setShift} />
    </div>
  )
}

function Dial({
  shift,
  setShift,
}: {
  shift: number
  setShift: (s: number) => void
}) {
  const size = SIZE
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, lastAngle: 0, accum: 0 })
  const [dragging, setDragging] = useState(false)
  const groupRef = useRef<SVGGElement>(null)

  const center = size / 2
  const outerR = center - 4
  const ringMid = outerR - 19
  const innerR = outerR - 38
  const dialR = innerR - 6
  const cipherR = dialR - 18
  const tickOuter = dialR - 3
  const tickInner = dialR - 10
  const hubR = Math.max(38, cipherR - 32)

  const rotation = useMotionValue(-shift * (360 / 26))

  // Frozen initial transform so the SSR'd HTML already paints the dial at
  // the right rotation. We capture the value at first render and never let
  // the JSX prop change after that — once the component mounts, the motion
  // value drives the attribute imperatively via setAttribute.
  const initialTransformRef = useRef<string | null>(null)
  if (initialTransformRef.current === null) {
    initialTransformRef.current = `rotate(${-shift * (360 / 26)} ${center} ${center})`
  }

  useLayoutEffect(() => {
    const apply = (v: number) => {
      if (groupRef.current)
        groupRef.current.setAttribute(
          "transform",
          `rotate(${v} ${center} ${center})`,
        )
    }
    apply(rotation.get())
    const unsub = rotation.on("change", apply)
    return unsub
  }, [center, rotation])

  useEffect(() => {
    if (dragRef.current.active) return
    const target = -shift * (360 / 26)
    const current = rotation.get()
    const delta = ((target - current + 540) % 360) - 180
    animate(rotation, current + delta, {
      type: "spring",
      stiffness: 240,
      damping: 26,
    })
  }, [shift, rotation])

  const getAngle = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    wrapRef.current?.setPointerCapture?.(e.pointerId)
    dragRef.current.active = true
    dragRef.current.lastAngle = getAngle(e.clientX, e.clientY)
    dragRef.current.accum = rotation.get()
    setDragging(true)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    const a = getAngle(e.clientX, e.clientY)
    let delta = a - dragRef.current.lastAngle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    dragRef.current.lastAngle = a
    dragRef.current.accum += delta
    rotation.set(dragRef.current.accum)
    const step = 360 / 26
    const s = mod(Math.round(-dragRef.current.accum / step), 26)
    if (s !== shift) setShift(s)
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    wrapRef.current?.releasePointerCapture?.(e.pointerId)
    setDragging(false)
    const step = 360 / 26
    const snap = Math.round(rotation.get() / step) * step
    animate(rotation, snap, { type: "spring", stiffness: 320, damping: 28 })
  }

  const outerLetters = useMemo(() => {
    const step = 360 / 26
    return ALPHABET.split("").map((ch, i) => {
      const angle = -90 + i * step
      const rad = (angle * Math.PI) / 180
      return {
        ch,
        i,
        x: center + ringMid * Math.cos(rad),
        y: center + ringMid * Math.sin(rad),
        angle,
      }
    })
  }, [center, ringMid])

  const innerLetters = useMemo(() => {
    const step = 360 / 26
    return ALPHABET.split("").map((ch, i) => {
      const angle = -90 + i * step
      const rad = (angle * Math.PI) / 180
      const isFive = i % 5 === 0
      return {
        ch,
        i,
        angle,
        isFive,
        x: center + cipherR * Math.cos(rad),
        y: center + cipherR * Math.sin(rad),
        t1x: center + tickOuter * Math.cos(rad),
        t1y: center + tickOuter * Math.sin(rad),
        t2x: center + tickInner * Math.cos(rad),
        t2y: center + tickInner * Math.sin(rad),
      }
    })
  }, [center, cipherR, tickOuter, tickInner])

  const plainTop = "A"
  const cipherTop = ALPHABET[shift]

  const wedgePath = useMemo(() => {
    const step = 360 / 26
    const half = step / 2
    const r1 = innerR
    const r2 = outerR
    const a1 = ((-90 - half) * Math.PI) / 180
    const a2 = ((-90 + half) * Math.PI) / 180
    const p1 = [center + r2 * Math.cos(a1), center + r2 * Math.sin(a1)]
    const p2 = [center + r2 * Math.cos(a2), center + r2 * Math.sin(a2)]
    const p3 = [center + r1 * Math.cos(a2), center + r1 * Math.sin(a2)]
    const p4 = [center + r1 * Math.cos(a1), center + r1 * Math.sin(a1)]
    return `M${p1[0]},${p1[1]} A${r2},${r2} 0 0 1 ${p2[0]},${p2[1]} L${p3[0]},${p3[1]} A${r1},${r1} 0 0 0 ${p4[0]},${p4[1]} Z`
  }, [center, innerR, outerR])

  return (
    <div className="flex w-full flex-col items-center">
      <div
        ref={wrapRef}
        className={`dial-wrap relative aspect-square w-full max-w-[360px] select-none ${dragging ? "dragging cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="xMidYMid meet"
          className="block overflow-visible"
        >
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="var(--cipher-card)"
            stroke="var(--cipher-line)"
            strokeWidth="1"
          />
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke="var(--cipher-line)"
            strokeWidth="1"
          />

          <path d={wedgePath} fill="var(--cipher-accent-soft)" opacity="0.7" />

          {outerLetters.map(({ ch, x, y, i }) => {
            const atTop = i === 0
            return (
              <text
                key={`ol-${ch}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono"
                fill={atTop ? "var(--cipher-accent)" : "var(--cipher-ink)"}
                style={{ fontSize: 13, fontWeight: atTop ? 700 : 500 }}
              >
                {ch}
              </text>
            )
          })}

          {outerLetters.map(({ angle }, i) => {
            const rad = (angle * Math.PI) / 180
            const r1 = innerR + 1
            const r2 = innerR + 5
            return (
              <line
                key={`ot-${i}`}
                x1={center + r1 * Math.cos(rad)}
                y1={center + r1 * Math.sin(rad)}
                x2={center + r2 * Math.cos(rad)}
                y2={center + r2 * Math.sin(rad)}
                stroke="var(--cipher-line)"
                strokeWidth="1"
              />
            )
          })}

          <g ref={groupRef} transform={initialTransformRef.current}>
            <circle
              cx={center}
              cy={center}
              r={dialR}
              fill="var(--cipher-bg-2)"
              stroke="var(--cipher-line)"
              strokeWidth="1"
            />

            {innerLetters.map(({ i, t1x, t1y, t2x, t2y, isFive }) => (
              <line
                key={`it-${i}`}
                x1={t1x}
                y1={t1y}
                x2={t2x}
                y2={t2y}
                stroke={isFive ? "var(--cipher-ink)" : "var(--cipher-muted)"}
                strokeOpacity={isFive ? 0.75 : 0.35}
                strokeWidth={isFive ? 1.25 : 1}
                strokeLinecap="round"
              />
            ))}

            {innerLetters.map(({ ch, x, y, i, angle }) => (
              <text
                key={`il-${ch}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${angle + 90} ${x} ${y})`}
                className="font-mono"
                fill={i === 0 ? "var(--cipher-accent-2)" : "var(--cipher-muted)"}
                style={{ fontSize: 11, fontWeight: i === 0 ? 700 : 500 }}
              >
                {ch}
              </text>
            ))}
          </g>

          <circle cx={center} cy={center} r={hubR} fill="var(--cipher-ink)" />
          <circle
            cx={center}
            cy={center}
            r={hubR}
            fill="none"
            stroke="var(--cipher-accent)"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* center label — inside SVG so it scales with viewBox */}
          <text
            x={center}
            y={center - hubR * 0.45}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono"
            fill="var(--cipher-muted)"
            style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              fontWeight: 500,
            }}
          >
            SHIFT
          </text>
          <text
            x={center}
            y={center + hubR * 0.04}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono"
            fill="var(--cipher-bg)"
            style={{
              fontSize: Math.round(hubR * 0.7),
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(shift).padStart(2, "0")}
          </text>
          <text
            x={center}
            y={center + hubR * 0.55}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono"
            style={{ fontSize: 10 }}
          >
            <tspan fill="var(--cipher-muted)">{plainTop} </tspan>
            <tspan fill="var(--cipher-muted)">→ </tspan>
            <tspan fill="var(--cipher-accent-2)">{cipherTop}</tspan>
          </text>

          {/* pointer notch — inside SVG so it scales too */}
          <path
            d={`M${center} ${4} L${center - 8} ${-4} L${center + 8} ${-4} Z`}
            fill="var(--cipher-accent)"
          />
        </svg>
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <Button
          onClick={() => setShift(mod(shift - 1, 26))}
          variant="outline"
          size="icon-sm"
          aria-label="Previous shift"
          style={{
            borderColor: "var(--cipher-line)",
            background: "var(--cipher-card)",
            color: "var(--cipher-ink)",
          }}
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        </Button>
        <div
          className="caesar-caption px-2 text-[11px]"
          style={{ color: "var(--cipher-muted)" }}
        >
          drag the dial · or step
        </div>
        <Button
          onClick={() => setShift(mod(shift + 1, 26))}
          variant="outline"
          size="icon-sm"
          aria-label="Next shift"
          style={{
            borderColor: "var(--cipher-line)",
            background: "var(--cipher-card)",
            color: "var(--cipher-ink)",
          }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
