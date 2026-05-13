import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError, createUser, getUserScoreboard } from "@/lib/api"
import {
  clearPlayer,
  getPlayerName,
  getPlayerUserId,
  setPlayerName,
  setPlayerUniqueId,
  setPlayerUserId,
} from "@/lib/leaderboard"

function needsRegistration(): boolean {
  const id = getPlayerUserId()
  const name = getPlayerName().trim()
  if (id == null) return true
  if (!name) return true
  if (name.toLowerCase() === "you") return true
  return false
}

export function NameGate() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (needsRegistration()) {
      setOpen(true)
      return
    }
    const id = getPlayerUserId()
    if (id == null) return
    let cancelled = false
    getUserScoreboard(id).catch((err) => {
      if (cancelled) return
      if (err instanceof ApiError && err.status === 404) {
        clearPlayer()
        setOpen(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const save = async () => {
    const trimmed = value.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const user = await createUser({ username: trimmed })
      setPlayerUserId(user.user_id)
      setPlayerUniqueId(user.unique_id)
      setPlayerName(user.username)
      setOpen(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That name is taken — try another.")
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Couldn't reach the server. Check your connection.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="name-gate"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(14, 10, 26, 0.65)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: "var(--cipher-card)",
              color: "var(--cipher-ink)",
              border: "1px solid var(--cipher-line)",
            }}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="mx-auto grid h-12 w-12 place-items-center rounded-full shadow-md"
              style={{ background: "var(--cipher-accent)" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <h2
              className="mt-3 text-center text-xl font-bold tracking-tight"
              style={{ color: "var(--cipher-ink)" }}
            >
              Enter your name
            </h2>
            <p
              className="mt-1 text-center text-sm"
              style={{ color: "var(--cipher-muted)" }}
            >
              This is how the leaderboard will know you.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void save()
              }}
              className="mt-4 space-y-3"
            >
              <Input
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError(null)
                }}
                maxLength={20}
                placeholder="e.g. Brutus"
                disabled={submitting}
                className="h-11 rounded-lg text-base shadow-none focus-visible:ring-0"
                style={{
                  background: "var(--cipher-bg-2)",
                  borderColor: "var(--cipher-line)",
                  color: "var(--cipher-ink)",
                }}
              />
              {error && (
                <div
                  className="rounded-md px-3 py-2 text-xs font-medium"
                  style={{
                    background:
                      "color-mix(in oklab, var(--cipher-accent-3) 14%, transparent)",
                    color: "var(--cipher-accent-3)",
                  }}
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={!value.trim() || submitting}
                className="h-11 w-full rounded-lg font-semibold text-white"
                style={{ background: "var(--cipher-accent)" }}
              >
                {submitting ? "Registering…" : "Continue"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
