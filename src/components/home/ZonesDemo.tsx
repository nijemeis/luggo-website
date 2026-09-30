"use client";

import { useState } from "react";
import { BagGlyph } from "@/components/glyphs";
import { zoneFor, ZONE_COLOR, ZONE_KEYS, ZONE_P, ZONE_TEXT, ZONE_WORD, type ZoneCopy } from "@/lib/zones";

/** Horizontal lane + slider + four clickable zone cards. The slider itself is the animation. */
export function ZonesDemo({ zones }: { zones: ZoneCopy }) {
  const [v, setV] = useState(30);
  const p = 1 - v / 100;
  const zone = zoneFor(p);
  const color = ZONE_COLOR[zone];

  return (
    <>
      <div className="hlane" aria-hidden="true">
        <div className="hlane-line" style={{ left: "30%", height: "46%", background: "#c9cfce", opacity: 0.6 }} />
        <div className="hlane-line" style={{ left: "52%", height: "64%", background: "#d8c9ac", opacity: 0.65 }} />
        <div className="hlane-line" style={{ left: "74%", height: "100%", width: 1.5, background: "#e5b79c", opacity: 0.7 }} />
        <div className="hlane-label" style={{ left: 20, color: "#8aa0af" }}>FAR</div>
        <div className="hlane-label" style={{ left: "calc(30% + 14px)", color: "#bf9a5d" }}>MEDIUM</div>
        <div className="hlane-label" style={{ left: "calc(74% + 14px)", color: "#d0805c" }}>NEAR</div>
        <div className="try-bag" style={{ left: `${7 + (1 - p) * 72}%`, transform: `translate(-50%,-50%) scale(${0.72 + (1 - p) * 0.42})` }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%)", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, ${color}00 66%)`, opacity: (0.18 + (1 - p) * 0.62) * 0.5, filter: "blur(3px)" }} />
            <div style={{ position: "relative" }}><BagGlyph type="suitcase" size={46 * 1.5} stroke={color} shadow /></div>
            <div style={{ position: "relative", marginTop: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "3px 10px", font: "700 11px var(--font-body)", color: "var(--body)", whiteSpace: "nowrap" }}>Your suitcase</div>
          </div>
        </div>
        <div className="you" style={{ right: 22, top: "50%", transform: "translateY(-50%)", gap: 7 }}>
          <div className="you-phone" style={{ width: 22, height: 38 }} />
          <div className="you-tag">YOU</div>
        </div>
      </div>

      <div className="slider-row">
        <label htmlFor="zone-slider">Drag the bag</label>
        <input id="zone-slider" type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} aria-valuetext={`${ZONE_WORD[zone]}: ${zones[zone].title}`} />
        <div className="zone-pill" style={{ color: ZONE_TEXT[zone], background: `${color}26` }} aria-live="polite">{ZONE_WORD[zone]}</div>
      </div>

      <div className="grid-fit" style={{ "--min": "230px", gap: 14, marginTop: 28 } as React.CSSProperties}>
        {ZONE_KEYS.map((k) => {
          const on = k === zone;
          const c = ZONE_COLOR[k];
          return (
            <button key={k} type="button" className="zone-card" aria-pressed={on} onClick={() => setV(Math.round((1 - ZONE_P[k]) * 100))} style={on ? { background: `${c}1a`, borderColor: c } : undefined}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                <span className="zc-word">{ZONE_WORD[k].toUpperCase()}</span>
              </div>
              <div className="zc-title">{zones[k].title}</div>
              <div className="zc-copy">{zones[k].copy.replace("{bag}", "Your bag")}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
