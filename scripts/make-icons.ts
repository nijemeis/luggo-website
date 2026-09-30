/**
 * Renders the Luggo app icon (same geometry as <AppIcon/> in src/components/glyphs.tsx)
 * into the favicon set and the default social share image. Run: npm run icons
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const icon = (rounded: boolean) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0.25" y1="0.07" x2="0.75" y2="0.93"><stop offset="0" stop-color="#e8895f"/><stop offset="1" stop-color="#d3663f"/></linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#782814" flood-opacity=".25"/></filter>
  </defs>
  <rect width="100" height="100" rx="${rounded ? 28 : 0}" fill="url(#g)"/>
  <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
  <circle cx="50" cy="50" r="31.5" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>
  <path d="M40.25 36.5V31a5 5 0 0 1 5-5h9.5a5 5 0 0 1 5 5v5.5" fill="none" stroke="#fff" stroke-width="3.5"/>
  <rect x="33" y="35.75" width="34" height="40" rx="11" fill="#fff" filter="url(#s)"/>
  <rect x="43.5" y="43.75" width="3.5" height="24" rx="1.75" fill="#eaa082"/>
  <rect x="53" y="43.75" width="3.5" height="24" rx="1.75" fill="#eaa082"/>
</svg>`;

async function main() {
  writeFileSync("src/app/icon.svg", icon(true));
  const square = Buffer.from(icon(false));
  await sharp(square, { density: 600 }).resize(180, 180).png().toFile("src/app/apple-icon.png");
  await sharp(Buffer.from(icon(true)), { density: 600 }).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(Buffer.from(icon(true)), { density: 600 }).resize(512, 512).png().toFile("public/icon-512.png");
  await sharp(square, { density: 600 }).resize(512, 512).png().toFile("public/icon-maskable-512.png");

  // 1200×630 share image: cream page, hero glow, rings, icon, headline.
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><radialGradient id="h" cx="0.76" cy="0.4" r="0.7"><stop offset="0" stop-color="#fbeee2"/><stop offset="1" stop-color="#faf7f2"/></radialGradient></defs>
    <rect width="1200" height="630" fill="url(#h)"/>
    <circle cx="930" cy="315" r="250" fill="none" stroke="#e0805c" stroke-opacity=".18" stroke-width="2"/>
    <circle cx="930" cy="315" r="175" fill="none" stroke="#e0805c" stroke-opacity=".3" stroke-width="2"/>
    <text x="90" y="150" font-family="Quicksand, Nunito, Helvetica, Arial, sans-serif" font-weight="700" font-size="40" fill="#2b2723">Luggo</text>
    <text x="90" y="300" font-family="Quicksand, Helvetica, Arial, sans-serif" font-weight="700" font-size="76" fill="#2b2723" letter-spacing="-1.5">See your bags</text>
    <text x="90" y="385" font-family="Quicksand, Helvetica, Arial, sans-serif" font-weight="700" font-size="76" fill="#2b2723" letter-spacing="-1.5">come to you.</text>
    <text x="90" y="470" font-family="Nunito, Helvetica, Arial, sans-serif" font-weight="600" font-size="28" fill="#6e6559">Bluetooth beacons for your luggage · luggo.net</text>
  </svg>`;
  const iconPng = await sharp(Buffer.from(icon(true)), { density: 600 }).resize(240, 240).png().toBuffer();
  await sharp(Buffer.from(og)).composite([{ input: iconPng, left: 810, top: 195 }]).png().toFile("public/og.png");
  console.log("Icons written.");
}

main();
