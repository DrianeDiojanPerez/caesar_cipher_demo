import { listScoreboard, type Scoreboard } from "./api"

export type LeaderboardEntry = {
  id: string
  userId: number
  name: string
  score: number
  totalCorrect: number
  totalQuestions: number
  avgTimeSeconds: number
}

const PLAYER_USER_ID_KEY = "caesar.player.user_id"
const PLAYER_UNIQUE_ID_KEY = "caesar.player.unique_id"
const PLAYER_NAME_KEY = "caesar.player.name"

export function getPlayerUserId(): number | null {
  const raw = localStorage.getItem(PLAYER_USER_ID_KEY)
  if (!raw) return null
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function setPlayerUserId(id: number) {
  localStorage.setItem(PLAYER_USER_ID_KEY, String(id))
}

export function getPlayerUniqueId(): string | null {
  return localStorage.getItem(PLAYER_UNIQUE_ID_KEY)
}

export function setPlayerUniqueId(uniqueId: string) {
  localStorage.setItem(PLAYER_UNIQUE_ID_KEY, uniqueId)
}

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) || ""
}

export function setPlayerName(name: string) {
  localStorage.setItem(PLAYER_NAME_KEY, name)
}

export function clearPlayer() {
  localStorage.removeItem(PLAYER_USER_ID_KEY)
  localStorage.removeItem(PLAYER_UNIQUE_ID_KEY)
  localStorage.removeItem(PLAYER_NAME_KEY)
  localStorage.removeItem("caesar.score")
  localStorage.removeItem("caesar.streak")
  localStorage.removeItem("caesar.best")
}

export function getPlayerId(): string {
  const id = getPlayerUserId()
  return id != null ? String(id) : ""
}

function entryFromScoreboard(s: Scoreboard): LeaderboardEntry {
  return {
    id: String(s.user_id),
    userId: s.user_id,
    name: s.username || `Player #${s.user_id}`,
    score: s.total_points,
    totalCorrect: s.total_correct,
    totalQuestions: s.total_questions,
    avgTimeSeconds: s.avg_time_seconds,
  }
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const rows = await listScoreboard({ limit })
  return rows.map(entryFromScoreboard)
}
