import { createFileRoute } from "@tanstack/react-router"

import { LeaderboardView } from "./leaderboard"

export const Route = createFileRoute("/live")({
  component: () => <LeaderboardView pollMs={1000} live />,
})
