"use client";

import { memo, useEffect, useRef, useState } from "react";
import { BagGlyph, type BagType } from "@/components/glyphs";
import { reflect, zoneFor, ZONE_COLOR, ZONE_WORD, type ZoneCopy, type ZoneKey } from "@/lib/zones";

type Bag = { id: number; name: string; type: BagType };

const BAGS: Bag[] = [
  { id: 1, name: "Blue duffel", type: "duffelbag" },
  { id: 2, name: "Carry-on", type: "cabinluggage" },
  { id: 3, name: "Kids’ backpack", type: "backpack" },
];
const SIDE_LANES = [26, 72, 38, 64];
const SPEED = 1; // keep it calm: the owner asked for slow movement
const STATIC_P = 0.18; // reduced motion: selected bag parked in Near

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * The radar lane. Owns the animation loop and re-renders itself every frame; the parent
 * only hears about zone changes, so the rest of the page stays still.
 */
const Lane = memo(function Lane({ selectedId, onZone }: { selectedId: number; onZone: (k: ZoneKey) => void }) {
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const onZoneRef = useRef(onZone);
  onZoneRef.current = onZone;

  useEffect(() => {
    if (reduced) {
      setP(STATIC_P);
      onZoneRef.current(zoneFor(STATIC_P));
      return;
    }
    const r = { p: 1, dir: -1, hold: 0, key: "" as string, visible: true, last: 0 };
    let raf = 0;
    const step = (t: number) => {
      const dt = r.last ? Math.min(50, t - r.last) : 16.67;
      r.last = t;
      const k = dt / 16.67;
      if (r.hold > 0) r.hold -= SPEED * k;
      else {
        const ease = 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, Math.max(0.02, r.p)));
        r.p += r.dir * 0.0014 * SPEED * ease * k;
        if (r.p <= 0) { r.p = 0; r.dir = 1; r.hold = 180; }
        if (r.p >= 1) { r.p = 1; r.dir = -1; r.hold = 120; }
      }
      setP(r.p);
      const key = zoneFor(r.p);
      if (key !== r.key) { r.key = key; onZoneRef.current(key); }
      raf = requestAnimationFrame(step);
    };
    const run = () => { if (!raf && r.visible && document.visibilityState === "visible") { r.last = 0; raf = requestAnimationFrame(step); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { r.visible = e.isIntersecting; if (r.visible) run(); else stop(); });
    if (boxRef.current) io.observe(boxRef.current);
    const onVis = () => (document.visibilityState === "visible" ? run() : stop());
    document.addEventListener("visibilitychange", onVis);
    run();
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [reduced]);

  let side = 0;
  return (
    <div ref={boxRef} className="lane-bags">
      {BAGS.map((b, i) => {
        const sel = b.id === selectedId;
        const bp = sel ? p : reflect(p + 0.42 + i * 0.5);
        const color = ZONE_COLOR[zoneFor(bp)];
        const lane = sel ? 50 : SIDE_LANES[side++ % SIDE_LANES.length];
        // Keep the selected bag's name pill clear of the YOU marker at the belt.
        const top = Math.min(10 + (1 - bp) * 62, sel ? 66 : 100);
        const scale = (0.5 + (1 - bp) * 0.72) * (sel ? 1 : 0.78);
        const glow = (0.18 + (1 - bp) * 0.62) * 0.5 * (sel ? 1 : 0.62);
        return (
          <div key={b.id} className="lane-bag" style={{ left: `${lane}%`, top: `${top}%`, transform: `translate(-50%,-50%) scale(${scale})`, zIndex: sel ? 4 : 2, opacity: sel ? 1 : 0.9 }}>
            <div className="bag-glow" style={{ background: `radial-gradient(circle, ${color} 0%, ${color}00 66%)`, opacity: glow }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <BagGlyph type={b.type} size={46 * 1.45} stroke={color} shadow />
              <div className="bag-name" style={{ color: sel ? color : "var(--muted)" }}>{b.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export function HeroPhone({ zones }: { zones: ZoneCopy }) {
  const [selectedId, setSelectedId] = useState(1);
  const [zone, setZone] = useState<ZoneKey>("far");
  const bag = BAGS.find((b) => b.id === selectedId) ?? BAGS[0];
  const z = zones[zone];
  const color = ZONE_COLOR[zone];
  const inRange = zone === "near" || zone === "here";

  return (
    <div className="phone" role="group" aria-label="The Luggo app’s radar screen: bags move from Far to Medium to Near as they come closer on the belt.">
      <div className="phone-screen">
        <div className="phone-island" />
        <div className="phone-status" aria-hidden="true"><span>9:41</span><span className="battery" /></div>
        <div className="phone-head">
          <div>
            <div className="phone-title">At the belt</div>
            <div className="phone-sub">3 in view</div>
          </div>
          <span className="live-chip"><span className="pulse-dot" />LIVE</span>
        </div>
        <div className="chips">
          {BAGS.map((b) => (
            <button key={b.id} type="button" className="chip" aria-pressed={b.id === selectedId} onClick={() => setSelectedId(b.id)}>{b.name}</button>
          ))}
        </div>
        <div className="lane" aria-hidden="true">
          <div className="lane-line" style={{ top: "20%", width: "52%", background: "#c9cfce", opacity: 0.5 }} />
          <div className="lane-line" style={{ top: "36%", width: "62%", background: "#cdccc6", opacity: 0.55 }} />
          <div className="lane-line" style={{ top: "55%", width: "74%", background: "#d8c9ac", opacity: 0.6 }} />
          <div className="lane-line" style={{ top: "78%", width: "100%", height: 1.5, background: "#e5b79c", opacity: 0.7 }} />
          <div className="lane-label" style={{ top: "11%", color: "#9db0bd" }}>FAR</div>
          <div className="lane-label" style={{ top: "47%", color: "#cfa96b" }}>MEDIUM</div>
          <div className="lane-label" style={{ top: "77%", color: "#dd8f6b" }}>NEAR</div>
          <Lane selectedId={selectedId} onZone={setZone} />
          {inRange && (
            <div className="in-range"><span className="dot" />{bag.name} is in range</div>
          )}
          <div className="you" style={{ bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
            <div className="you-phone" />
            <div className="you-tag">YOU</div>
          </div>
        </div>
        <div className="readout">
          <div style={{ minWidth: 0 }}>
            <div className="readout-title">{z.title}</div>
            <div className="readout-copy">{z.copy.replace("{bag}", bag.name)}</div>
          </div>
          <div className="zone-word" style={{ color, background: `${color}22` }}>{ZONE_WORD[zone]}</div>
        </div>
        <div className="tabbar" aria-hidden="true">
          <div className="tab"><TabBags />Bags</div>
          <div className="tab on"><TabRadar />Radar</div>
          <div className="tab"><TabShop />Shop</div>
          <div className="tab"><TabSettings />Settings</div>
        </div>
      </div>
    </div>
  );
}

const TabBags = () => (
  <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 5V3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /><rect x="1" y="5" width="20" height="14" rx="5" /></svg>
);
const TabRadar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="10" cy="10" r="3.5" fill="currentColor" /></svg>
);
const TabShop = () => (
  <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8V6a5 5 0 0 1 10 0v2" /><path d="M1.5 7h19v6a6 6 0 0 1-6 6h-7a6 6 0 0 1-6-6Z" /></svg>
);
const TabSettings = () => (
  <svg width="22" height="20" viewBox="0 0 22 20" fill="currentColor"><rect x="1" y="5" width="14" height="2" rx="1" /><circle cx="18" cy="6" r="3" /><circle cx="4" cy="14" r="3" /><rect x="8" y="13" width="14" height="2" rx="1" /></svg>
);
