import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { QRCodeCanvas } from "qrcode.react"
import { Check, ChevronDown, Copy, Download, QrCode } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  shift: number
  output: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRPanel({ shift, output, open, onOpenChange }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
    params.set("m", "decode")
    return `${base}?${params.toString()}`
  }, [output])

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1400)
    } catch {
      /* noop */
    }
  }

  const onDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement("a")
    a.href = canvas.toDataURL("image/png")
    a.download = `caesar-cipher-shift-${shift}.png`
    a.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-4 p-5"
        style={{
          background: "var(--cipher-card)",
          color: "var(--cipher-ink)",
          borderColor: "var(--cipher-line)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--cipher-ink)" }}
          >
            <QrCode
              className="h-4 w-4"
              style={{ color: "var(--cipher-accent)" }}
            />
            Shareable QR
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-lg p-3"
            style={{
              background: "var(--cipher-card)",
              border: "1px solid var(--cipher-line)",
            }}
          >
            <QRCodeCanvas
              ref={canvasRef}
              value={url}
              size={220}
              fgColor={isDark ? "#f5f0ff" : "#1a1623"}
              bgColor={isDark ? "#160e29" : "#ffffff"}
              level="M"
            />
          </div>

          <div className="w-full min-w-0">
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

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                onClick={onCopyLink}
                variant="outline"
                size="sm"
                style={{
                  borderColor: "var(--cipher-line)",
                  background: "var(--cipher-card)",
                  color: "var(--cipher-ink)",
                }}
              >
                {copiedLink ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--cipher-accent)" }}
                    />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </>
                )}
              </Button>
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                style={{
                  borderColor: "var(--cipher-line)",
                  background: "var(--cipher-card)",
                  color: "var(--cipher-ink)",
                }}
              >
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
              <Button
                onClick={() => setShowDetails((s) => !s)}
                variant="ghost"
                size="sm"
                aria-expanded={showDetails}
                style={{ color: "var(--cipher-muted)" }}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
                />
                {showDetails ? "Hide details" : "Show details"}
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {showDetails && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden text-xs leading-relaxed"
                  style={{ color: "var(--cipher-muted)" }}
                >
                  Scanning opens this app pre-loaded in decode mode. The dial
                  starts at 0 — the recipient spins to find the shift you used
                  (shift{" "}
                  <span
                    className="font-mono"
                    style={{ color: "var(--cipher-accent)" }}
                  >
                    {shift}
                  </span>
                  ).
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
