import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Clock, Flame, Play, RotateCcw, Trophy } from "lucide-react"
import { caesar } from "@/lib/caesar"
import { ScrambleText } from "./scramble-text"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CipherDial } from "./cipher-dial"
import { Segmented } from "./segmented"

type InputMode = "dial" | "slider"

const GAME_PHRASES = [
  "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
  "ET TU BRUTE THEN FALL CAESAR",
  "VENI VIDI VICI I CAME I SAW I CONQUERED",
  "ALEA IACTA EST THE DIE IS CAST",
  "ALL ROADS LEAD TO ROME EVENTUALLY",
  "BEWARE THE IDES OF MARCH MY FRIEND",
  "PRACTICE MAKES THE CIPHER PERFECT",
  "MEET ME AT THE OLD OAK AT MIDNIGHT",
  "THE EAGLE FLIES AT DAWN TOMORROW",
  "KEEP IT SECRET KEEP IT SAFE ALWAYS",
  "CRYPTOGRAPHY IS THE ART OF WRITING SECRETS",
  "A WISE GENERAL ALWAYS HAS A BACKUP PLAN",
]

type Difficulty = "easy" | "medium" | "hard"

const DIFFICULTIES: Record<
  Difficulty,
  { label: string; time: number; scoreBase: number; shiftRange: [number, number] }
> = {
  easy: { label: "Easy", time: 60, scoreBase: 100, shiftRange: [1, 7] },
  medium: { label: "Medium", time: 45, scoreBase: 200, shiftRange: [1, 25] },
  hard: { label: "Hard", time: 25, scoreBase: 400, shiftRange: [1, 25] },
}

type Puzzle = { phrase: string; cipher: string; trueShift: number }
type Phase = "idle" | "playing" | "won" | "lost"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CipherGame({ open, onOpenChange }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [phase, setPhase] = useState<Phase>("idle")
  const [round, setRound] = useState(0)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [guess, setGuess] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [lastDelta, setLastDelta] = useState<number | null>(null)
  const [inputMode, setInputModeState] = useState<InputMode>("slider")
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setScore(parseInt(localStorage.getItem("caesar.score") || "0", 10))
    setStreak(parseInt(localStorage.getItem("caesar.streak") || "0", 10))
    setBest(parseInt(localStorage.getItem("caesar.best") || "0", 10))
    const saved = localStorage.getItem("caesar.game.input")
    if (saved === "dial" || saved === "slider") setInputModeState(saved)
  }, [])

  const setInputMode = (mode: InputMode) => {
    setInputModeState(mode)
    localStorage.setItem("caesar.game.input", mode)
  }

  const cfg = DIFFICULTIES[difficulty]

  const newRound = useCallback(() => {
    const phrase =
      GAME_PHRASES[(Math.random() * GAME_PHRASES.length) | 0]
    const [lo, hi] = cfg.shiftRange
    const trueShift = lo + ((Math.random() * (hi - lo + 1)) | 0)
    const cipher = caesar(phrase, trueShift, false)
    setPuzzle({ phrase, cipher, trueShift })
    setGuess(0)
    setTimeLeft(cfg.time)
    setLastDelta(null)
    setPhase("playing")
    setRound((r) => r + 1)
  }, [cfg])

  useEffect(() => {
    if (phase !== "playing") return
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          if (tickRef.current) clearInterval(tickRef.current)
          setPhase("lost")
          setStreak(0)
          localStorage.setItem("caesar.streak", "0")
          return 0
        }
        return +(t - 0.1).toFixed(1)
      })
    }, 100)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [phase])

  const submit = () => {
    if (phase !== "playing" || !puzzle) return
    if (guess === puzzle.trueShift) {
      const bonus = Math.round((timeLeft / cfg.time) * cfg.scoreBase)
      const total = cfg.scoreBase + bonus
      const newScore = score + total
      const newStreak = streak + 1
      const newBest = Math.max(best, total)
      setScore(newScore)
      setStreak(newStreak)
      setBest(newBest)
      setLastDelta(total)
      localStorage.setItem("caesar.score", String(newScore))
      localStorage.setItem("caesar.streak", String(newStreak))
      localStorage.setItem("caesar.best", String(newBest))
      setPhase("won")
    } else {
      setStreak(0)
      localStorage.setItem("caesar.streak", "0")
      setPhase("lost")
    }
  }

  const reset = () => {
    setPhase("idle")
    setPuzzle(null)
    setGuess(0)
    setLastDelta(null)
  }

  const preview = useMemo(() => {
    if (!puzzle) return ""
    return caesar(puzzle.cipher, guess, true)
  }, [puzzle, guess])

  const timePct = puzzle ? (timeLeft / cfg.time) * 100 : 0
  const timeColor =
    timeLeft < 10
      ? "var(--cipher-accent-3)"
      : timeLeft < 20
        ? "var(--cipher-accent-2)"
        : "var(--cipher-accent)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 gap-0 sm:max-w-xl"
        style={{
          background: "var(--cipher-card)",
          color: "var(--cipher-ink)",
          borderColor: "var(--cipher-line)",
        }}
      >
        <div
          className="relative flex items-center justify-between px-5 py-4"
          style={{ background: "var(--cipher-accent)" }}
        >
          <div className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            <div>
              <div className="font-bold tracking-tight">Crack the Cipher</div>
              <div className="caesar-caption text-[11px] opacity-80">
                guess the shift to decode
              </div>
            </div>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="icon-sm"
            aria-label="Close game"
            className="text-white hover:bg-white/20 hover:text-white"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        {phase !== "playing" && (
          <div
            className="grid grid-cols-3 divide-x"
            style={{
              borderBottom: "1px solid var(--cipher-line)",
              borderColor: "var(--cipher-line)",
            }}
          >
            <Stat label="SCORE" value={score} color="var(--cipher-accent)" />
            <Stat
              label="STREAK"
              value={streak}
              icon={
                streak > 0 ? (
                  <Flame
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--cipher-accent-2)" }}
                  />
                ) : null
              }
              color="var(--cipher-accent-2)"
            />
            <Stat label="BEST" value={best} color="var(--cipher-accent-3)" />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5 text-center"
              >
                <div className="py-4">
                  <div
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "var(--cipher-ink)" }}
                  >
                    Ready to decrypt?
                  </div>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--cipher-muted)" }}
                  >
                    Beat the clock. Pick the shift that unlocks the message.
                  </p>
                </div>
                <div>
                  <div
                    className="mb-2 font-mono text-[10px] tracking-[0.15em]"
                    style={{ color: "var(--cipher-muted)" }}
                  >
                    DIFFICULTY
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(DIFFICULTIES) as Array<[Difficulty, typeof DIFFICULTIES[Difficulty]]>).map(([k, v]) => (
                      <Button
                        key={k}
                        onClick={() => setDifficulty(k)}
                        variant="ghost"
                        className="h-auto flex-col items-start gap-0 rounded-xl p-3 text-left"
                        style={{
                          background:
                            difficulty === k
                              ? "var(--cipher-accent-soft)"
                              : "transparent",
                          border: `1px solid ${
                            difficulty === k
                              ? "var(--cipher-accent)"
                              : "var(--cipher-line)"
                          }`,
                        }}
                      >
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color:
                              difficulty === k
                                ? "var(--cipher-accent)"
                                : "var(--cipher-ink)",
                          }}
                        >
                          {v.label}
                        </div>
                        <div
                          className="mt-0.5 font-mono text-[10px]"
                          style={{ color: "var(--cipher-muted)" }}
                        >
                          {v.time}s · {v.scoreBase}pt
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={newRound}
                  className="h-12 w-full rounded-xl font-semibold text-white"
                  style={{ background: "var(--cipher-accent)" }}
                >
                  <Play className="h-4 w-4" />
                  Start round
                </Button>
              </motion.div>
            )}

            {phase === "playing" && puzzle && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div
                      className="flex items-center gap-1.5 font-mono text-xs"
                      style={{ color: "var(--cipher-muted)" }}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span
                        className={timeLeft < 10 ? "wiggle" : ""}
                        style={{ color: timeColor, fontWeight: 600 }}
                      >
                        {timeLeft.toFixed(1)}s
                      </span>
                    </div>
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: "var(--cipher-muted)" }}
                    >
                      ROUND {round}
                    </div>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full"
                    style={{ background: "var(--cipher-line)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${timePct}%` }}
                      transition={{ duration: 0.1, ease: "linear" }}
                      style={{ background: timeColor }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Segmented<InputMode>
                      value={inputMode}
                      onChange={setInputMode}
                      options={[
                        { value: "slider", label: "Slider" },
                        { value: "dial", label: "Dial" },
                      ]}
                    />
                  </div>
                  {inputMode === "slider" ? (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={guess}
                        onChange={(e) =>
                          setGuess(parseInt(e.target.value, 10))
                        }
                        className="cipher-range w-full"
                      />
                      <div
                        className="flex justify-between font-mono text-[10px]"
                        style={{ color: "var(--cipher-muted)" }}
                      >
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                      </div>
                    </div>
                  ) : (
                    <CipherDial shift={guess} setShift={setGuess} />
                  )}
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--cipher-bg-2)",
                    border: "1px solid var(--cipher-line)",
                  }}
                >
                  <div
                    className="mb-1.5 font-mono text-[10px] tracking-[0.15em]"
                    style={{ color: "var(--cipher-muted)" }}
                  >
                    CIPHERTEXT
                  </div>
                  <div
                    className="font-mono text-[15px] leading-relaxed break-words"
                    style={{ color: "var(--cipher-ink)" }}
                  >
                    {puzzle.cipher}
                  </div>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--cipher-card)",
                    border: "1.5px dashed var(--cipher-accent)",
                  }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div
                      className="font-mono text-[10px] tracking-[0.15em]"
                      style={{ color: "var(--cipher-accent)" }}
                    >
                      YOUR GUESS · SHIFT {guess}
                    </div>
                  </div>
                  <div
                    className="font-mono text-[15px] leading-relaxed break-words"
                    style={{ color: "var(--cipher-ink)" }}
                  >
                    <ScrambleText text={preview} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="h-11 rounded-xl px-4 text-sm font-medium"
                    style={{
                      borderColor: "var(--cipher-line)",
                      color: "var(--cipher-muted)",
                      background: "transparent",
                    }}
                  >
                    Quit
                  </Button>
                  <Button
                    onClick={submit}
                    className="h-11 flex-1 rounded-xl font-semibold text-white"
                    style={{ background: "var(--cipher-accent)" }}
                  >
                    Submit guess
                  </Button>
                </div>
              </motion.div>
            )}

            {phase === "won" && puzzle && (
              <motion.div
                key="won"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-2 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 14 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                  style={{ background: "var(--cipher-accent-2)" }}
                >
                  <Trophy className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <div
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "var(--cipher-ink)" }}
                  >
                    Cracked it!
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: "var(--cipher-muted)" }}
                  >
                    Shift was{" "}
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--cipher-accent)" }}
                    >
                      {puzzle.trueShift}
                    </span>
                  </div>
                </div>
                {lastDelta != null && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="shimmer-text font-mono text-3xl font-bold"
                  >
                    +{lastDelta}
                  </motion.div>
                )}
                <div
                  className="rounded-xl p-3 font-mono text-sm"
                  style={{
                    background: "var(--cipher-bg-2)",
                    border: "1px solid var(--cipher-line)",
                    color: "var(--cipher-ink)",
                  }}
                >
                  {puzzle.phrase}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="h-11 rounded-xl px-4 text-sm font-medium"
                    style={{
                      borderColor: "var(--cipher-line)",
                      color: "var(--cipher-muted)",
                    }}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={newRound}
                    className="h-11 flex-1 rounded-xl font-semibold text-white"
                    style={{ background: "var(--cipher-accent)" }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Next round
                  </Button>
                </div>
              </motion.div>
            )}

            {phase === "lost" && puzzle && (
              <motion.div
                key="lost"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-2 text-center"
              >
                <div
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                  style={{
                    background: "var(--cipher-bg-2)",
                    border: "1px solid var(--cipher-line)",
                  }}
                >
                  <Clock
                    className="h-8 w-8"
                    style={{ color: "var(--cipher-accent-3)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "var(--cipher-ink)" }}
                  >
                    {timeLeft === 0 ? "Time's up!" : "Not quite."}
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: "var(--cipher-muted)" }}
                  >
                    The shift was{" "}
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--cipher-accent-3)" }}
                    >
                      {puzzle.trueShift}
                    </span>
                    {guess !== puzzle.trueShift && (
                      <>
                        {" "}
                        · you guessed{" "}
                        <span className="font-mono">{guess}</span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 font-mono text-sm"
                  style={{
                    background: "var(--cipher-bg-2)",
                    border: "1px solid var(--cipher-line)",
                    color: "var(--cipher-ink)",
                  }}
                >
                  {puzzle.phrase}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="h-11 rounded-xl px-4 text-sm font-medium"
                    style={{
                      borderColor: "var(--cipher-line)",
                      color: "var(--cipher-muted)",
                    }}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={newRound}
                    className="h-11 flex-1 rounded-xl font-semibold text-white"
                    style={{ background: "var(--cipher-accent)" }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon?: React.ReactNode
}) {
  return (
    <div
      className="px-4 py-3 text-center"
      style={{ borderColor: "var(--cipher-line)" }}
    >
      <div
        className="mb-0.5 font-mono text-[9px] tracking-[0.15em]"
        style={{ color: "var(--cipher-muted)" }}
      >
        {label}
      </div>
      <div
        className="inline-flex items-center justify-center gap-1 font-mono text-lg font-bold tabular-nums"
        style={{ color }}
      >
        {value}
        {icon}
      </div>
    </div>
  )
}
