import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { DEFAULT_THEME, THEMES } from "@/lib/themes"

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
