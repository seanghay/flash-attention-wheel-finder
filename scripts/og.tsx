/** @jsxRuntime automatic @jsxImportSource react */
/**
 * Renders the Open Graph / Twitter card to public/og.jpg with Takumi.
 *
 * Colors mirror the app's dark theme (the oklch tokens in src/index.css converted
 * to sRGB) and the wheel count is read from the generated index, so the card can't
 * drift from what the site actually shows.
 *
 *   pnpm og
 */
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { render } from "takumi-js"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fontDir = path.join(root, "node_modules/geist/dist/fonts/geist-mono")

const C = {
  bg: "#090909",
  card: "#121212",
  fg: "#f2f2f2",
  muted: "#929292",
  border: "#292929",
  fa: "#bea4ff",
  python: "#6bb9f8",
  cuda: "#6fd087",
  torch: "#f7a062",
}

type Chip = { label: string; value: string; color: string }

function Chip({ label, value, color }: Chip) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${color}40`,
        backgroundColor: `${color}1a`,
        padding: "12px 18px",
      }}
    >
      <div style={{ width: 8, height: 8, backgroundColor: color }} />
      <span style={{ color: `${color}b0`, fontSize: 24, fontWeight: 300 }}>{label}</span>
      <span style={{ color, fontSize: 26, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

async function main() {
  const index = JSON.parse(
    await readFile(path.join(root, "public/wheels.json"), "utf8"),
  ) as { wheels: { fa: string; python: string; cuda: string; torch: string }[] }

  const count = index.wheels.length.toLocaleString("en-US")
  const latest = index.wheels[0]

  const chips: Chip[] = [
    { label: "flash-attn", value: latest.fa, color: C.fa },
    { label: "py", value: latest.python, color: C.python },
    { label: "cu", value: latest.cuda, color: C.cuda },
    { label: "torch", value: latest.torch, color: C.torch },
  ]

  const jpg = await render(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: C.bg,
        // Same dot matrix the site uses, at OG scale.
        backgroundImage: "radial-gradient(#ffffff26 1.5px, transparent 1.5px)",
        backgroundSize: "34px 34px",
        padding: 72,
        fontFamily: "Geist Mono",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              backgroundColor: C.fg,
            }}
          >
            {/* Lightning bolt, matching the flash-attn dimension icon. */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill={C.bg}
              aria-hidden="true"
            >
              <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
            </svg>
          </div>
          <span style={{ color: C.muted, fontSize: 26, fontWeight: 300 }}>
            prebuilt wheel index
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 40 }}>
          <span style={{ color: C.fg, fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            flash-attention
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <span
            style={{ color: C.muted, fontSize: 76, fontWeight: 200, lineHeight: 1.1 }}
          >
            wheel finder
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.map((c) => (
            <Chip key={c.label} {...c} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${C.border}`,
            paddingTop: 30,
          }}
        >
          {/* Both halves must stay on one line, so neither is allowed to wrap. */}
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <span style={{ color: C.fg, fontSize: 26, fontWeight: 600 }}>{count}</span>
            <span style={{ color: C.muted, fontSize: 26, fontWeight: 300 }}>
              wheels indexed
            </span>
          </div>
          <span
            style={{
              color: C.muted,
              fontSize: 23,
              fontWeight: 300,
              flexShrink: 0,
            }}
          >
            seanghay.github.io/flash-attention-wheel-finder
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      format: "jpeg",
      quality: 92,
      fonts: [
        { name: "Geist Mono", weight: 200, data: await readFile(`${fontDir}/GeistMono-Light.ttf`) },
        { name: "Geist Mono", weight: 300, data: await readFile(`${fontDir}/GeistMono-Light.ttf`) },
        { name: "Geist Mono", weight: 500, data: await readFile(`${fontDir}/GeistMono-Medium.ttf`) },
        { name: "Geist Mono", weight: 600, data: await readFile(`${fontDir}/GeistMono-SemiBold.ttf`) },
        { name: "Geist Mono", weight: 700, data: await readFile(`${fontDir}/GeistMono-Bold.ttf`) },
      ],
    },
  )

  const out = path.join(root, "public/og.jpg")
  await writeFile(out, jpg)
  console.log(`wrote ${path.relative(root, out)} (${(jpg.length / 1024).toFixed(0)} KB)`)
}

main()
