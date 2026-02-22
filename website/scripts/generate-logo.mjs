import satori from "satori"
import sharp from "sharp"
import { readFile } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const LEVEL_COLORS = [
  "#4ADE80",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#DC2626",
  "#991B1B",
]

// Fetch font
async function fetchFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}&display=swap`
  const cssRes = await fetch(url)
  const css = await cssRes.text()
  const match = css.match(/src: url\(([^)]+)\)/)
  if (!match) throw new Error(`No font URL found for weight ${weight}`)
  const fontRes = await fetch(match[1])
  return fontRes.arrayBuffer()
}

async function generate() {
  const bold = await fetchFont(800)

  // GitHub org avatar — square, looks good at 500x500 and tiny sizes
  const size = 500

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #0c1222 0%, #162032 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "80px",
        },
        children: [
          // 7 dots
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "10px",
                marginBottom: "32px",
              },
              children: LEVEL_COLORS.map((color) => ({
                type: "div",
                props: {
                  style: {
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  },
                },
              })),
            },
          },
          // OP text
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: "160px",
                fontWeight: 800,
                letterSpacing: "-6px",
                lineHeight: 1,
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { color: "#ffffff" },
                    children: "O",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#0D9488" },
                    children: "P",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Inter Tight",
          data: bold,
          weight: 800,
          style: "normal",
        },
      ],
    }
  )

  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()

  const outPath = join(__dirname, "..", "public", "logo.png")
  await sharp(png).toFile(outPath)
  console.log(`Logo generated: ${outPath} (${size}x${size})`)

  // Also generate a smaller version for GitHub (recommended 400x400)
  const ghPath = join(__dirname, "..", "..", "logo-github.png")
  await sharp(png).resize(400, 400).png().toFile(ghPath)
  console.log(`GitHub avatar: ${ghPath} (400x400)`)
}

generate().catch(console.error)
