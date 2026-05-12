export type ThemeKey =
  | "violet"
  | "blue"
  | "emerald"
  | "rose"
  | "sunset"
  | "slate"
  | "dark-green"
  | "midnight"
  | "ocean"
  | "amber"

type ThemeVars = {
  bg: string
  bg2: string
  card: string
  ink: string
  muted: string
  line: string
  accent: string
  accent2: string
  accent3: string
  accentSoft: string
}

export type Theme = {
  key: ThemeKey
  label: string
  light: ThemeVars
  dark: ThemeVars
}

export const THEMES: Record<ThemeKey, Theme> = {
  violet: {
    key: "violet",
    label: "Violet",
    light: {
      bg: "#fdfaf6",
      bg2: "#fff5e8",
      card: "#ffffff",
      ink: "#1a1623",
      muted: "#6b6478",
      line: "#ecdfd0",
      accent: "#7c3aed",
      accent2: "#f59e0b",
      accent3: "#ec4899",
      accentSoft: "#f3e8ff",
    },
    dark: {
      bg: "#0e0a1a",
      bg2: "#1a0f2e",
      card: "#160e29",
      ink: "#f5f0ff",
      muted: "#9d96b8",
      line: "#2a1f44",
      accent: "#a78bfa",
      accent2: "#fbbf24",
      accent3: "#f472b6",
      accentSoft: "#2a1f44",
    },
  },
  blue: {
    key: "blue",
    label: "Blue",
    light: {
      bg: "#f8fbff",
      bg2: "#eff6ff",
      card: "#ffffff",
      ink: "#0a1530",
      muted: "#5b6b89",
      line: "#dbeafe",
      accent: "#2563eb",
      accent2: "#06b6d4",
      accent3: "#f43f5e",
      accentSoft: "#dbeafe",
    },
    dark: {
      bg: "#070d1f",
      bg2: "#0d1838",
      card: "#0b1430",
      ink: "#e6efff",
      muted: "#8aa1c9",
      line: "#1e3a5f",
      accent: "#60a5fa",
      accent2: "#22d3ee",
      accent3: "#fb7185",
      accentSoft: "#1e3a5f",
    },
  },
  emerald: {
    key: "emerald",
    label: "Emerald",
    light: {
      bg: "#f6fdf9",
      bg2: "#ecfdf5",
      card: "#ffffff",
      ink: "#022c22",
      muted: "#5b7065",
      line: "#d1fae5",
      accent: "#059669",
      accent2: "#f59e0b",
      accent3: "#0ea5e9",
      accentSoft: "#d1fae5",
    },
    dark: {
      bg: "#04130d",
      bg2: "#082018",
      card: "#061a12",
      ink: "#ecfdf5",
      muted: "#86b099",
      line: "#0d3a26",
      accent: "#34d399",
      accent2: "#fbbf24",
      accent3: "#38bdf8",
      accentSoft: "#0d3a26",
    },
  },
  rose: {
    key: "rose",
    label: "Rose",
    light: {
      bg: "#fff8f9",
      bg2: "#ffe4e6",
      card: "#ffffff",
      ink: "#1f0a14",
      muted: "#7a5660",
      line: "#fecdd3",
      accent: "#e11d48",
      accent2: "#f59e0b",
      accent3: "#8b5cf6",
      accentSoft: "#ffe4e6",
    },
    dark: {
      bg: "#180610",
      bg2: "#280d1a",
      card: "#1f0917",
      ink: "#fce7f3",
      muted: "#c39aa6",
      line: "#4c1d24",
      accent: "#fb7185",
      accent2: "#fbbf24",
      accent3: "#a78bfa",
      accentSoft: "#4c1d24",
    },
  },
  sunset: {
    key: "sunset",
    label: "Sunset",
    light: {
      bg: "#fffaf5",
      bg2: "#fff7ed",
      card: "#ffffff",
      ink: "#1a0e05",
      muted: "#7c6c5b",
      line: "#fed7aa",
      accent: "#ea580c",
      accent2: "#ec4899",
      accent3: "#14b8a6",
      accentSoft: "#ffedd5",
    },
    dark: {
      bg: "#140805",
      bg2: "#231009",
      card: "#1b0c07",
      ink: "#fff7ed",
      muted: "#b59a82",
      line: "#431407",
      accent: "#fb923c",
      accent2: "#f472b6",
      accent3: "#2dd4bf",
      accentSoft: "#431407",
    },
  },
  slate: {
    key: "slate",
    label: "Slate",
    light: {
      bg: "#f8fafc",
      bg2: "#f1f5f9",
      card: "#ffffff",
      ink: "#0f172a",
      muted: "#64748b",
      line: "#e2e8f0",
      accent: "#334155",
      accent2: "#f59e0b",
      accent3: "#0ea5e9",
      accentSoft: "#e2e8f0",
    },
    dark: {
      bg: "#08101c",
      bg2: "#0e1726",
      card: "#0b1422",
      ink: "#e2e8f0",
      muted: "#94a3b8",
      line: "#1e293b",
      accent: "#cbd5e1",
      accent2: "#fbbf24",
      accent3: "#38bdf8",
      accentSoft: "#1e293b",
    },
  },
  "dark-green": {
    key: "dark-green",
    label: "Dark Green",
    light: {
      bg: "#f3f7f3",
      bg2: "#e6efe6",
      card: "#fafdfa",
      ink: "#0c1f10",
      muted: "#5a6b5d",
      line: "#c8d6c8",
      accent: "#15803d",
      accent2: "#ea580c",
      accent3: "#0ea5e9",
      accentSoft: "#dcfce7",
    },
    dark: {
      bg: "#04110a",
      bg2: "#081d12",
      card: "#06160d",
      ink: "#d8f3dc",
      muted: "#7a9985",
      line: "#13321e",
      accent: "#4ade80",
      accent2: "#fbbf24",
      accent3: "#06b6d4",
      accentSoft: "#13321e",
    },
  },
  midnight: {
    key: "midnight",
    label: "Midnight",
    light: {
      bg: "#faf8ff",
      bg2: "#f3edff",
      card: "#ffffff",
      ink: "#1a0f2e",
      muted: "#675791",
      line: "#e9dffd",
      accent: "#6d28d9",
      accent2: "#f59e0b",
      accent3: "#ec4899",
      accentSoft: "#ede4fe",
    },
    dark: {
      bg: "#050211",
      bg2: "#0c0625",
      card: "#080319",
      ink: "#e9defb",
      muted: "#8b7ab8",
      line: "#1a0f33",
      accent: "#c084fc",
      accent2: "#fbbf24",
      accent3: "#f472b6",
      accentSoft: "#1a0f33",
    },
  },
  ocean: {
    key: "ocean",
    label: "Ocean",
    light: {
      bg: "#f0fdfa",
      bg2: "#ccfbf1",
      card: "#ffffff",
      ink: "#042f2e",
      muted: "#506b67",
      line: "#a7f3d0",
      accent: "#0d9488",
      accent2: "#f59e0b",
      accent3: "#a855f7",
      accentSoft: "#ccfbf1",
    },
    dark: {
      bg: "#02181a",
      bg2: "#05262a",
      card: "#031e21",
      ink: "#ccfbf1",
      muted: "#7faaa6",
      line: "#0e3a3a",
      accent: "#5eead4",
      accent2: "#fbbf24",
      accent3: "#c084fc",
      accentSoft: "#0e3a3a",
    },
  },
  amber: {
    key: "amber",
    label: "Amber",
    light: {
      bg: "#fffbeb",
      bg2: "#fef3c7",
      card: "#ffffff",
      ink: "#1f1304",
      muted: "#806a3a",
      line: "#fde68a",
      accent: "#d97706",
      accent2: "#dc2626",
      accent3: "#059669",
      accentSoft: "#fef3c7",
    },
    dark: {
      bg: "#160d03",
      bg2: "#241606",
      card: "#1b1004",
      ink: "#fef3c7",
      muted: "#b99a64",
      line: "#3f2a0a",
      accent: "#fbbf24",
      accent2: "#f87171",
      accent3: "#34d399",
      accentSoft: "#3f2a0a",
    },
  },
}

export const THEME_KEYS: Array<ThemeKey> = [
  "violet",
  "blue",
  "emerald",
  "rose",
  "sunset",
  "slate",
  "dark-green",
  "midnight",
  "ocean",
  "amber",
]

export const DEFAULT_THEME: ThemeKey = "violet"

const VAR_MAP: Array<[keyof ThemeVars, string]> = [
  ["bg", "--cipher-bg"],
  ["bg2", "--cipher-bg-2"],
  ["card", "--cipher-card"],
  ["ink", "--cipher-ink"],
  ["muted", "--cipher-muted"],
  ["line", "--cipher-line"],
  ["accent", "--cipher-accent"],
  ["accent2", "--cipher-accent-2"],
  ["accent3", "--cipher-accent-3"],
  ["accentSoft", "--cipher-accent-soft"],
]

export function applyTheme(themeKey: ThemeKey, dark: boolean) {
  const theme = THEMES[themeKey] ?? THEMES[DEFAULT_THEME]
  const vars = dark ? theme.dark : theme.light
  const root = document.documentElement
  for (const [field, cssVar] of VAR_MAP) {
    root.style.setProperty(cssVar, vars[field])
  }
}
