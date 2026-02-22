import satori from "satori";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Fetch Inter font in TTF format from Google Fonts
// Using an older user-agent to get TTF instead of woff2
async function fetchFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const cssRes = await fetch(url, {
    headers: {
      // Old user-agent triggers TTF format from Google Fonts
      "User-Agent": "Mozilla/4.0",
    },
  });
  const css = await cssRes.text();
  const fontUrlMatch = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/);
  if (!fontUrlMatch) {
    throw new Error(`Could not find TTF font URL for weight ${weight}. CSS: ${css.slice(0, 200)}`);
  }
  console.log(`  Fetching Inter weight ${weight}...`);
  const fontRes = await fetch(fontUrlMatch[1]);
  if (!fontRes.ok) throw new Error(`Failed to fetch font: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

async function main() {
  console.log("Fetching fonts...");
  const [interBold, interRegular, interMedium] = await Promise.all([
    fetchFont(700),
    fetchFont(400),
    fetchFont(500),
  ]);

  const levelColors = [
    "#4ADE80",
    "#22C55E",
    "#EAB308",
    "#F97316",
    "#EF4444",
    "#DC2626",
    "#991B1B",
  ];

  const markup = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
        fontFamily: "Inter",
      },
      children: [
        // Dots row
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              marginBottom: "40px",
            },
            children: levelColors.map((color) => ({
              type: "div",
              props: {
                style: {
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: color,
                },
              },
            })),
          },
        },
        // Title
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1.1,
            },
            children: [
              {
                type: "span",
                props: {
                  style: { color: "#ffffff" },
                  children: "Open",
                },
              },
              {
                type: "span",
                props: {
                  style: { color: "#0D9488" },
                  children: "Progression",
                },
              },
            ],
          },
        },
        // Subtitle
        {
          type: "div",
          props: {
            style: {
              fontSize: "28px",
              color: "#94a3b8",
              marginTop: "20px",
              fontWeight: 400,
            },
            children: "An open standard for fitness progression.",
          },
        },
        // Stats line
        {
          type: "div",
          props: {
            style: {
              fontSize: "20px",
              color: "#64748b",
              marginTop: "48px",
              fontWeight: 500,
              display: "flex",
              flexDirection: "row",
              gap: "8px",
            },
            children: "7 Levels  |  8 Categories  |  1.3M+ Data Points  |  MIT Licensed",
          },
        },
      ],
    },
  };

  console.log("Rendering SVG with satori...");
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: interRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: interMedium,
        weight: 500,
        style: "normal",
      },
      {
        name: "Inter",
        data: interBold,
        weight: 700,
        style: "normal",
      },
    ],
  });

  console.log("Converting SVG to PNG with sharp...");
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const outputPath = join(ROOT, "public", "og.png");
  await writeFile(outputPath, pngBuffer);
  console.log(`OG image saved to ${outputPath}`);
  console.log(`File size: ${(pngBuffer.length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
