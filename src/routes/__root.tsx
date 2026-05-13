import { useEffect, useState } from "react"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Toaster } from "sileo"

import appCss from "../styles.css?url"
import { DEFAULT_THEME, THEMES } from "@/lib/themes"
import { NameGate } from "@/components/name-gate"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Caesar — rotary cipher" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

const VAR_MAP_JSON = JSON.stringify([
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
])

const themeInitScript = `
try {
  var s = localStorage.getItem('caesar.dark');
  var d = s != null ? s === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (d) document.documentElement.classList.add('dark');

  var THEMES = ${JSON.stringify(THEMES)};
  var MAP = ${VAR_MAP_JSON};
  var tk = localStorage.getItem('caesar.theme');
  if (!THEMES[tk]) tk = ${JSON.stringify(DEFAULT_THEME)};
  var v = d ? THEMES[tk].dark : THEMES[tk].light;
  var root = document.documentElement;
  for (var i = 0; i < MAP.length; i++) {
    root.style.setProperty(MAP[i][1], v[MAP[i][0]]);
  }
} catch (e) {}
`

function ThemedToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      )
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => obs.disconnect()
  }, [])
  return (
    <Toaster
      position="bottom-center"
      theme={theme}
      offset={20}
      options={{
        roundness: 14,
        duration: 8000,
        styles: {
          title:
            "font-semibold tracking-tight text-[var(--cipher-ink)] [font-family:'Geist_Variable',ui-sans-serif,system-ui,sans-serif]",
          description:
            "text-xs font-normal text-[var(--cipher-muted)] opacity-80 [font-family:'Geist_Variable',ui-sans-serif,system-ui,sans-serif]",
          badge:
            "bg-[var(--cipher-accent)] text-white ring-1 ring-[var(--cipher-accent)]/30",
        },
      }}
    />
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <NameGate />
        <ThemedToaster />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
