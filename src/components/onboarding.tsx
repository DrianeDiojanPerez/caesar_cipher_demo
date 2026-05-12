import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRight, QrCode } from "lucide-react"
import { ALPHABET } from "@/lib/caesar"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

export function Onboarding({ open, onOpenChange, onDone }: Props) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Spin to set the shift",
      body: "Drag the rotary dial to choose how many positions to shift each letter. The number in the center is your key — 0 through 25.",
      illo: <DialIllo />,
    },
    {
      title: "Type a message",
      body: "Encode plain text into a cipher, or paste a cipher and switch to Decode. The output updates as you turn.",
      illo: <TypeIllo />,
    },
    {
      title: "Share with a QR",
      body: "Generate a QR that opens this app with the cipher and shift pre-loaded. Your recipient just scans and reads.",
      illo: <QRIllo />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 gap-0"
        style={{
          background: "var(--cipher-card)",
          color: "var(--cipher-ink)",
          borderColor: "var(--cipher-line)",
        }}
      >
        <div
          className="grid h-44 place-items-center overflow-hidden"
          style={{
            background:
              "linear-gradient(to bottom, var(--cipher-bg-2), var(--cipher-card))",
            borderBottom: "1px solid var(--cipher-line)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {steps[step].illo}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="font-mono text-[10px] tracking-[0.15em] uppercase"
              style={{ color: "var(--cipher-muted)" }}
            >
              Step {step + 1} of 3
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h3
                className="text-lg font-semibold tracking-tight"
                style={{ color: "var(--cipher-ink)" }}
              >
                {steps[step].title}
              </h3>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: "var(--cipher-muted)" }}
              >
                {steps[step].body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setStep(i)}
                  variant="ghost"
                  aria-label={`Go to step ${i + 1}`}
                  className="h-1.5 min-w-0 rounded-full p-0 hover:bg-transparent"
                  style={{
                    width: i === step ? 24 : 6,
                    background:
                      i === step
                        ? "var(--cipher-accent)"
                        : "var(--cipher-line)",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="ghost"
                  style={{ color: "var(--cipher-muted)" }}
                >
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="text-white"
                  style={{ background: "var(--cipher-accent)" }}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={onDone}
                  className="text-white"
                  style={{ background: "var(--cipher-accent)" }}
                >
                  Get started
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DialIllo() {
  const SIZE = 320
  const center = SIZE / 2
  const outerR = center - 4
  const ringMid = outerR - 19
  const innerR = outerR - 38
  const dialR = innerR - 6
  const cipherR = dialR - 18
  const tickOuter = dialR - 3
  const tickInner = dialR - 10
  const hubR = Math.max(38, cipherR - 32)

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

  return (
    <div style={{ width: 140, height: 140 }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        height="100%"
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

        {outerLetters.map(({ ch, x, y, i }) => (
          <text
            key={`ol-${ch}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono"
            fill={i === 0 ? "var(--cipher-accent)" : "var(--cipher-ink)"}
            style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500 }}
          >
            {ch}
          </text>
        ))}

        <g className="dial-illo-ring">
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
              fill={
                i === 0 ? "var(--cipher-accent-2)" : "var(--cipher-muted)"
              }
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

        <text
          x={center}
          y={center - hubR * 0.45}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono"
          fill="var(--cipher-muted)"
          style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 500 }}
        >
          SHIFT
        </text>
        <text
          x={center}
          y={center + hubR * 0.08}
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
          07
        </text>

        <path
          d={`M${center} ${4} L${center - 8} ${-4} L${center + 8} ${-4} Z`}
          fill="var(--cipher-accent)"
        />
      </svg>
    </div>
  )
}

function TypeIllo() {
  const [i, setI] = useState(0)
  const samples = ["HELLO", "OLSSV", "WORLD"]
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % samples.length), 1200)
    return () => clearInterval(t)
  }, [samples.length])
  return (
    <div className="flex items-center gap-3 font-mono">
      <div
        className="w-24 rounded-md px-3 py-2 text-center text-sm"
        style={{
          border: "1px solid var(--cipher-line)",
          background: "var(--cipher-card)",
          color: "var(--cipher-ink)",
        }}
      >
        HELLO
      </div>
      <ChevronRight
        className="h-4 w-4"
        style={{ color: "var(--cipher-muted)" }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="w-24 rounded-md px-3 py-2 text-center text-sm text-white"
          style={{ background: "var(--cipher-accent)" }}
        >
          {samples[i]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function QRIllo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
    >
      <QrCode
        className="h-[104px] w-[104px]"
        strokeWidth={1.25}
        style={{ color: "var(--cipher-accent)" }}
      />
    </motion.div>
  )
}
