import { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { QRCodeCanvas } from "qrcode.react"
import { Check, Copy, QrCode, X } from "lucide-react"

type Props = {
  shift: number
  output: string
  onClose: () => void
}

export function QRPanel({ shift, output, onClose }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains("dark"))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => obs.disconnect()
  }, [])

  const url = useMemo(() => {
    if (typeof window === "undefined") return ""
    const base = location.origin + location.pathname
    const params = new URLSearchParams()
    params.set("c", output)
    params.set("s", String(shift))
    params.set("m", "decode")
    return `${base}?${params.toString()}`
  }, [output, shift])

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1400)
    } catch {
      /* noop */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="overflow-hidden"
    >
      <div
        className="mt-4 overflow-hidden rounded-xl"
        style={{
          border: "1px solid var(--cipher-line)",
          background: "var(--cipher-card)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--cipher-line)" }}
        >
          <div className="flex items-center gap-2">
            <QrCode
              className="h-4 w-4"
              style={{ color: "var(--cipher-accent)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--cipher-ink)" }}
            >
              Shareable QR
            </span>
          </div>
          <button
            onClick={onClose}
            className="transition"
            style={{ color: "var(--cipher-muted)" }}
            aria-label="Close QR panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr]">
          <div
            className="justify-self-center rounded-lg p-3"
            style={{
              background: "var(--cipher-card)",
              border: "1px solid var(--cipher-line)",
            }}
          >
            <QRCodeCanvas
              value={url}
              size={220}
              fgColor={isDark ? "#f5f0ff" : "#1a1623"}
              bgColor={isDark ? "#160e29" : "#ffffff"}
              level="M"
            />
          </div>
          <div className="min-w-0">
            <p
              className="mb-1.5 font-mono text-xs tracking-wider uppercase"
              style={{ color: "var(--cipher-muted)" }}
            >
              Recipient opens
            </p>
            <div
              className="max-h-24 overflow-auto rounded-md p-2.5 font-mono text-sm break-all"
              style={{
                background: "var(--cipher-bg-2)",
                border: "1px solid var(--cipher-line)",
                color: "var(--cipher-ink)",
              }}
            >
              {url}
            </div>
            <p
              className="mt-3 text-xs leading-relaxed"
              style={{ color: "var(--cipher-muted)" }}
            >
              Scanning opens this app pre-loaded in decode mode with shift{" "}
              <span
                className="font-mono"
                style={{ color: "var(--cipher-accent)" }}
              >
                {shift}
              </span>
              .
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onCopyLink}
                className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition"
                style={{
                  border: "1px solid var(--cipher-line)",
                  background: "var(--cipher-card)",
                  color: "var(--cipher-ink)",
                }}
              >
                {copiedLink ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--cipher-accent)" }}
                    />{" "}
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
