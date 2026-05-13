import { useEffect, useMemo, useRef, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Crown,
  Flame,
  Medal,
  Minus,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react"
import confetti from "canvas-confetti"
import { sileo } from "sileo"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchLeaderboard,
  getPlayerId,
  type LeaderboardEntry,
} from "@/lib/leaderboard"

export const Route = createFileRoute("/leaderboard")({
  component: () => <LeaderboardView pollMs={POLL_MS} />,
})

const POLL_MS = Math.max(
  500,
  parseInt(import.meta.env.VITE_LEADERBOARD_POLL_MS ?? "3000", 10) || 3000,
)

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return v || fallback
}

function celebrate() {
  const accent = readCssVar("--cipher-accent", "#7c3aed")
  const accent2 = readCssVar("--cipher-accent-2", "#f59e0b")
  const accent3 = readCssVar("--cipher-accent-3", "#ec4899")
  const colors = [accent, accent2, accent3, "#ffffff"]
  const baseOpts = {
    particleCount: 90,
    startVelocity: 50,
    spread: 70,
    ticks: 220,
    colors,
    scalar: 1.05,
  }
  confetti({ ...baseOpts, origin: { x: 0.1, y: 0.95 }, angle: 70 })
  confetti({ ...baseOpts, origin: { x: 0.9, y: 0.95 }, angle: 110 })
  window.setTimeout(() => {
    confetti({
      ...baseOpts,
      particleCount: 140,
      origin: { x: 0.5, y: 0.95 },
      angle: 90,
      spread: 110,
    })
  }, 220)
}

const TIER_COLORS = ["var(--cipher-accent)", "#cbd5e1", "#b45309"] as const

export function LeaderboardView({
  pollMs,
  live = false,
}: {
  pollMs: number
  live?: boolean
}) {
  const [entries, setEntries] = useState<Array<LeaderboardEntry>>([])
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState<string>("")
  const [reachedTop, setReachedTop] = useState(false)
  const [showCelebrate, setShowCelebrate] = useState(false)
  const prevTopIdRef = useRef<string | null>(null)
  const prevRankRef = useRef<Map<string, number>>(new Map())
  const [rankDelta, setRankDelta] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    setPlayerId(getPlayerId())
  }, [])

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const data = await fetchLeaderboard()
        if (!cancelled) {
          const prevRanks = prevRankRef.current
          const deltas = new Map<string, number>()
          data.forEach((e, i) => {
            const before = prevRanks.get(e.id)
            if (before !== undefined) deltas.set(e.id, before - i)
          })
          setRankDelta(deltas)
          const next = new Map<string, number>()
          data.forEach((e, i) => next.set(e.id, i))
          prevRankRef.current = next
          setEntries(data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    tick()
    const id = setInterval(tick, pollMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [pollMs])

  useEffect(() => {
    if (!entries.length || !playerId) return
    const top = entries[0]
    const playerIsTop = top.id === playerId
    const prevTopId = prevTopIdRef.current

    if (prevTopId !== null && prevTopId !== top.id) {
      celebrate()
      sileo.success({
        title: `${top.name} reached the top!`,
        description: `${top.score.toLocaleString()} points · #1 on the board`,
        icon: <Trophy className="h-4 w-4" />,
      })
    }

    if (playerIsTop && prevTopId !== playerId) {
      setShowCelebrate(true)
      window.setTimeout(() => setShowCelebrate(false), 2400)
    }
    setReachedTop(playerIsTop)
    prevTopIdRef.current = top.id
  }, [entries, playerId])

  const yourRank = useMemo(() => {
    const idx = entries.findIndex((e) => e.id === playerId)
    return idx === -1 ? null : idx + 1
  }, [entries, playerId])

  const yourEntry = useMemo(
    () => entries.find((e) => e.id === playerId) ?? null,
    [entries, playerId],
  )

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ color: "var(--cipher-ink)", background: "var(--cipher-bg)" }}
    >
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b3" />
      </div>

      <header className="sticky top-3 z-30 mx-auto w-fit max-w-[calc(100%-1.5rem)] px-3 sm:top-4 sm:px-4">
        <div
          className="flex h-14 items-center gap-2 rounded-full pl-3 pr-5 backdrop-blur-xl shadow-lg"
          style={{
            background:
              "color-mix(in oklab, var(--cipher-bg) 70%, transparent)",
            border: "1px solid var(--cipher-line)",
          }}
        >
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg px-2 text-xs font-medium"
              style={{ color: "var(--cipher-muted)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div
            className="caesar-caption text-xs"
            style={{ color: "var(--cipher-ink)" }}
          >
            {live ? "Live" : "Leaderboard"}
          </div>
          {live && (
            <div
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase"
              style={{
                background:
                  "color-mix(in oklab, var(--cipher-accent-3) 18%, transparent)",
                color: "var(--cipher-accent-3)",
              }}
            >
              <motion.span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--cipher-accent-3)" }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Live
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl space-y-6 px-5 py-10 sm:px-6">
        <section className="space-y-3 text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(120deg, var(--cipher-accent), var(--cipher-accent-2), var(--cipher-accent-3))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {live ? "Live board" : "Leaderboard"}
          </h1>
        </section>

        {/* You stats */}
        <section
          className="grid grid-cols-3 divide-x rounded-xl"
          style={{
            background: "var(--cipher-card)",
            border: "1px solid var(--cipher-line)",
            borderColor: "var(--cipher-line)",
          }}
        >
          <StatCell label="YOUR RANK" loading={loading}>
            {yourRank ? `#${yourRank}` : "—"}
          </StatCell>
          <StatCell label="YOUR SCORE" loading={loading}>
            <CountUp value={yourEntry?.score ?? 0} />
          </StatCell>
          <StatCell label="PLAYERS" loading={loading}>
            {entries.length}
          </StatCell>
        </section>

        <AnimatePresence>
          {reachedTop && !loading && (
            <motion.section
              key="champ-banner"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md"
              style={{ background: "var(--cipher-accent)" }}
            >
              <Trophy className="h-4 w-4" />
              You&apos;re #1 — long live the Caesar
            </motion.section>
          )}
        </AnimatePresence>

        {/* Podium */}
        <section>
          {loading ? (
            <div className="grid grid-cols-3 items-end gap-3">
              {[0, 1, 2].map((i) => (
                <PodiumSkeleton key={i} tier={i} />
              ))}
            </div>
          ) : podium.length > 0 ? (
            <div className="grid grid-cols-3 items-end gap-3">
              {/* render order: 2nd, 1st, 3rd for nicer podium feel */}
              {[podium[1], podium[0], podium[2]].map((e, slot) => {
                if (!e) return <div key={`empty-${slot}`} />
                const rank = entries.indexOf(e) + 1
                return (
                  <PodiumCard
                    key={e.id}
                    entry={e}
                    rank={rank}
                    isYou={e.id === playerId}
                    slot={slot}
                  />
                )
              })}
            </div>
          ) : null}
        </section>

        {/* Rest of list */}
        <section
          className="overflow-hidden rounded-xl"
          style={{
            background: "var(--cipher-card)",
            border: "1px solid var(--cipher-line)",
          }}
        >
          {loading ? (
            <ul
              className="divide-y"
              style={{ borderColor: "var(--cipher-line)" }}
            >
              {Array.from({ length: 7 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </li>
              ))}
            </ul>
          ) : rest.length === 0 ? (
            <div
              className="px-5 py-8 text-center text-sm"
              style={{ color: "var(--cipher-muted)" }}
            >
              Only the podium so far. Play to claim a spot!
            </div>
          ) : (
            <motion.ul
              layout
              className="divide-y"
              style={{ borderColor: "var(--cipher-line)" }}
            >
              <AnimatePresence initial={false}>
                {rest.map((e, i) => {
                  const rank = i + 4
                  const isYou = e.id === playerId
                  const delta = rankDelta.get(e.id) ?? 0
                  return (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 32,
                      }}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        background: isYou
                          ? "var(--cipher-accent-soft)"
                          : "transparent",
                      }}
                    >
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold tabular-nums"
                        style={{
                          background: "var(--cipher-bg-2)",
                          color: "var(--cipher-ink)",
                        }}
                      >
                        {rank}
                      </div>
                      <RankDelta delta={delta} />
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-sm font-semibold"
                          style={{
                            color: isYou
                              ? "var(--cipher-accent)"
                              : "var(--cipher-ink)",
                          }}
                        >
                          {e.name}
                          {isYou && (
                            <span
                              className="caesar-caption ml-2 text-[10px]"
                              style={{ color: "var(--cipher-muted)" }}
                            >
                              you
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums"
                        style={{ color: "var(--cipher-ink)" }}
                      >
                        <Star className="h-3.5 w-3.5" />
                        <CountUp value={e.score} />
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </section>

      </main>

      <AnimatePresence>
        {showCelebrate && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1.05, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="rounded-3xl px-8 py-6 text-center shadow-2xl"
              style={{
                background: "var(--cipher-accent)",
                color: "#ffffff",
              }}
            >
              <Trophy className="mx-auto h-12 w-12" />
              <div className="mt-2 text-2xl font-bold tracking-tight">
                You reached the top!
              </div>
              <div className="text-sm opacity-90">
                Hail Caesar
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCell({
  label,
  loading,
  children,
}: {
  label: string
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col items-center px-3 py-4 text-center"
      style={{ borderColor: "var(--cipher-line)" }}
    >
      <div
        className="caesar-caption text-[10px] tracking-[0.15em]"
        style={{ color: "var(--cipher-muted)" }}
      >
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums">
        {loading ? <Skeleton className="h-6 w-12" /> : children}
      </div>
    </div>
  )
}

function PodiumCard({
  entry,
  rank,
  isYou,
  slot,
}: {
  entry: LeaderboardEntry
  rank: number
  isYou: boolean
  slot: number // 0=left(2nd), 1=center(1st), 2=right(3rd)
}) {
  const tierIdx = rank - 1 // 0 = gold, 1 = silver, 2 = bronze
  const tierColor = TIER_COLORS[tierIdx]
  const isFirst = rank === 1
  const height = isFirst ? 168 : 140
  const Icon = isFirst ? Crown : Medal
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        delay: slot * 0.06,
      }}
      className="relative flex flex-col items-center rounded-2xl px-3 pt-4 pb-3 shadow-md"
      style={{
        minHeight: height,
        background: isFirst
          ? "linear-gradient(160deg, color-mix(in oklab, var(--cipher-accent) 22%, var(--cipher-card)), var(--cipher-card))"
          : "var(--cipher-card)",
        border: `1px solid ${isFirst ? "var(--cipher-accent)" : "var(--cipher-line)"}`,
      }}
    >
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 18,
          delay: slot * 0.06 + 0.05,
        }}
        className="grid h-10 w-10 place-items-center rounded-full shadow-sm"
        style={{ background: tierColor, color: "#ffffff" }}
      >
        <Icon className={isFirst ? "h-5 w-5" : "h-4 w-4"} />
      </motion.div>
      <div
        className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.15em]"
        style={{ color: "var(--cipher-muted)" }}
      >
        #{rank}
      </div>
      <div
        className="mt-1 truncate max-w-full text-sm font-bold"
        style={{
          color: isYou ? "var(--cipher-accent)" : "var(--cipher-ink)",
        }}
        title={entry.name}
      >
        {entry.name}
      </div>
      {isYou && (
        <span
          className="caesar-caption text-[9px] tracking-[0.12em] uppercase"
          style={{ color: "var(--cipher-muted)" }}
        >
          you
        </span>
      )}
      <div
        className="mt-auto flex items-center gap-1 pt-2 font-mono text-base font-bold tabular-nums"
        style={{ color: isFirst ? "var(--cipher-accent)" : "var(--cipher-ink)" }}
      >
        <Star className={`h-3.5 w-3.5 ${isFirst ? "fill-current" : ""}`} />
        <CountUp value={entry.score} />
      </div>
      {isFirst && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="pointer-events-none absolute -top-2 right-3"
        >
          <Sparkles
            className="h-4 w-4"
            style={{ color: "var(--cipher-accent-2)" }}
          />
        </motion.div>
      )}
      {isFirst && entry.score > 0 && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase"
          style={{
            background: "var(--cipher-accent)",
            color: "#ffffff",
          }}
        >
          <Flame className="h-2.5 w-2.5" />
          champ
        </motion.div>
      )}
    </motion.div>
  )
}

function PodiumSkeleton({ tier }: { tier: number }) {
  const height = tier === 1 ? 168 : 140
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl px-3 pt-4 pb-3"
      style={{
        minHeight: height,
        background: "var(--cipher-card)",
        border: "1px solid var(--cipher-line)",
      }}
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-2.5 w-8" />
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="mt-auto h-4 w-12" />
    </div>
  )
}

function RankDelta({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <Minus
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--cipher-muted)" }}
      />
    )
  }
  if (delta > 0) {
    return (
      <div
        className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-bold"
        style={{ color: "#16a34a" }}
      >
        <ChevronUp className="h-3.5 w-3.5" />
        {delta}
      </div>
    )
  }
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-bold"
      style={{ color: "var(--cipher-accent-3)" }}
    >
      <ChevronDown className="h-3.5 w-3.5" />
      {Math.abs(delta)}
    </div>
  )
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  useEffect(() => {
    const from = fromRef.current
    if (from === value) return
    const start = performance.now()
    const duration = 500
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = Math.round(from + (value - from) * eased)
      setDisplay(v)
      if (p < 1) raf = requestAnimationFrame(step)
      else fromRef.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{display.toLocaleString()}</>
}
