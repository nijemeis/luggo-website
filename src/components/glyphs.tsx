/**
 * Luggo's glyphs as SVG, drawn from the CSS primitives in the design prototype
 * (appIcon() and bagIcon() in docs/design/Luggo Website.dc.html). Same silhouettes,
 * one 46×46 unit grid for bags and a 100×100 grid for the app icon.
 */

export type BagType = "cabinluggage" | "suitcase" | "duffelbag" | "backpack";

const SEAM = "#e2d6c2";

export function BagGlyph({ type, size = 46, stroke, fill = "#f4ecdf", shadow = false }: { type: BagType; size?: number; stroke: string; fill?: string; shadow?: boolean }) {
  const sw = 2;
  const common = { fill: "none", stroke, strokeWidth: sw };
  let body: React.ReactNode;
  switch (type) {
    case "cabinluggage":
      body = (
        <>
          <path d="M16.5 12V9a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v3" {...common} />
          <rect x="10" y="12" width="26" height="29" rx="7" fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x="17.5" y="17" width="3" height="19" rx="1.5" fill={SEAM} />
          <rect x="25.5" y="17" width="3" height="19" rx="1.5" fill={SEAM} />
        </>
      );
      break;
    case "suitcase":
      body = (
        <>
          <path d="M16 14a7 7 0 0 1 14 0" {...common} />
          <rect x="4" y="14" width="38" height="25" rx="7" fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x="16" y="18" width="2.5" height="17" rx="1.25" fill={SEAM} />
          <rect x="29" y="24" width="6" height="5" rx="1.5" fill={SEAM} />
        </>
      );
      break;
    case "duffelbag":
      body = (
        <>
          <path d="M14 15v-3.5a3.5 3.5 0 0 1 7 0V15" {...common} />
          <path d="M25 15v-3.5a3.5 3.5 0 0 1 7 0V15" {...common} />
          <rect x="3" y="15" width="40" height="22" rx="11" fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x="10" y="25" width="26" height="2" rx="1" fill={SEAM} />
        </>
      );
      break;
    default:
      body = (
        <>
          <rect x="7" y="12" width="3" height="24" rx="1.5" fill={stroke} />
          <rect x="36" y="12" width="3" height="24" rx="1.5" fill={stroke} />
          <path d="M19 10.5a4 4 0 0 1 8 0" {...common} />
          <rect x="9" y="10" width="28" height="31" rx="9" fill={fill} stroke={stroke} strokeWidth={sw} />
          <rect x="15" y="18" width="16" height="2" rx="1" fill={SEAM} />
          <rect x="15.5" y="25" width="15" height="10" rx="4" fill="none" stroke={SEAM} strokeWidth={sw} />
        </>
      );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" style={shadow ? { filter: "drop-shadow(0 10px 12px rgba(120,90,50,.22))", overflow: "visible" } : { overflow: "visible" }}>
      {body}
    </svg>
  );
}

/** The app icon: coral squircle, two white rings, white suitcase with two seams. */
export function AppIcon({ size = 34, shadow = false, title }: { size?: number; shadow?: boolean; title?: string }) {
  const id = `lg-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ flex: "0 0 auto", display: "block", filter: shadow ? "drop-shadow(0 20px 22px rgba(120,50,20,.34))" : undefined, overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0.25" y1="0.07" x2="0.75" y2="0.93">
          <stop offset="0" stopColor="#e8895f" />
          <stop offset="1" stopColor="#d3663f" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="28" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="3" />
      <circle cx="50" cy="50" r="31.5" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" />
      <path d="M40.25 36.5V31a5 5 0 0 1 5-5h9.5a5 5 0 0 1 5 5v5.5" fill="none" stroke="#fff" strokeWidth="3.5" />
      <rect x="33" y="35.75" width="34" height="40" rx="11" fill="#fff" style={{ filter: "drop-shadow(0 5px 6px rgba(120,50,20,.25))" }} />
      <rect x="43.5" y="43.75" width="3.5" height="24" rx="1.75" fill="#eaa082" />
      <rect x="53" y="43.75" width="3.5" height="24" rx="1.75" fill="#eaa082" />
    </svg>
  );
}

/** The beacon tile: sand rounded rectangle, coral border, coral dot. */
export function Beacon({ w, h, radius, border = 2, dot, bg }: { w: number; h: number; radius: number; border?: number; dot: number; bg?: string }) {
  return (
    <span className="beacon" style={{ width: w, height: h, borderRadius: radius, borderWidth: border, background: bg }} aria-hidden="true">
      <i style={{ width: dot, height: dot }} />
    </span>
  );
}

/** Shopping-bag glyph used on the cart button. */
export function CartGlyph() {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5.5 8V6a4.5 4.5 0 0 1 9 0v2" />
      <path d="M2 7h16v6a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7Z" strokeLinejoin="round" />
    </svg>
  );
}
