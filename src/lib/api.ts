export type Health = {
  status: string
  message: string
}

export type User = {
  user_id: number
  unique_id: string
  username: string
}

export type Scoreboard = {
  score_id: number
  user_id: number
  username: string
  total_questions: number
  total_correct: number
  total_wrong: number
  total_time_seconds: number
  avg_time_seconds: number
  total_points: number
}

export type CreateUserRequest = {
  username: string
}

export type AddResultsRequest = {
  is_correct: boolean
  time_seconds: number
  points?: number
}

export type ApiErrorBody = {
  error?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, message: string, body: ApiErrorBody | null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""

if (!BASE_URL && typeof window !== "undefined") {
  console.warn(
    "[api] VITE_API_BASE_URL is not set — all API calls will fail. " +
      "Add it to your .env file."
  )
}

async function request<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | undefined> }
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (init?.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    let body: ApiErrorBody | null = null
    try {
      body = (await res.json()) as ApiErrorBody
    } catch {
      body = null
    }
    throw new ApiError(
      res.status,
      body?.error ?? `Request failed: ${res.status} ${res.statusText}`,
      body
    )
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function health(): Promise<Health> {
  return request<Health>("/")
}

export function createUser(req: CreateUserRequest): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export function listScoreboard(opts?: {
  limit?: number
}): Promise<Array<Scoreboard>> {
  return request<Array<Scoreboard>>("/scoreboard", {
    query: { limit: opts?.limit },
  })
}

export function getUserScoreboard(userId: number): Promise<Scoreboard> {
  return request<Scoreboard>(`/scoreboard/${userId}`)
}

export function addResults(
  userId: number,
  req: AddResultsRequest
): Promise<Scoreboard> {
  return request<Scoreboard>(`/scoreboard/${userId}/results`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export function resetScoreboard(userId: number): Promise<Scoreboard> {
  return request<Scoreboard>(`/scoreboard/${userId}/reset`, { method: "POST" })
}
