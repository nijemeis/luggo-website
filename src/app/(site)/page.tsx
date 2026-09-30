import { getContent, fill, telHref } from "@/lib/content";
import { getFaq, getPacks, getStock } from "@/lib/catalog";
import { money } from "@/lib/money";
import { imgSrc, imgSrcSet } from "@/lib/image-urls";
import { AppIcon, Beacon } from "@/components/glyphs";
import { HeroPhone } from "@/components/home/HeroPhone";
import { ZonesDemo } from "@/components/home/ZonesDemo";
import { Shop } from "@/components/home/Shop";
import { Faq } from "@/components/home/Faq";

export default async function HomePage() {
  const [c, packs, faq, stock] = await Promise.all([getContent(), getPacks(), getFaq(), getStock()]);
  const fromPrice = packs.length ? money(Math.min(...packs.map((p) => p.priceCents))) : "";
  const zones = { far: c.zones.far, med: c.zones.med, near: c.zones.near, here: c.zones.here };
  const b = c.business;

  return (
    <main>
      {/* HERO */}
      <section id="top" className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="pill"><span className="pulse-dot" />{c.hero.pill}</span>
            <h1 className="h1">{c.hero.headline}</h1>
            <p className="hero-lead">{c.hero.lead}</p>
            <div className="hero-ctas">
              <a href="#shop" className="btn btn-primary">{fill(c.hero.primaryCta, { fromPrice })}</a>
              <a href="#how" className="btn btn-secondary">{c.hero.secondaryCta}</a>
            </div>
            <div className="hero-small">{c.hero.small}</div>
          </div>
          <div className="hero-stage">
            <div className="ring ring-hero" />
            <div className="ring ring-hero" style={{ animationDelay: "2.1s" }} />
            <HeroPhone zones={zones} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="anchor">
        <div className="wrap section">
          <div className="kicker">{c.how.kicker}</div>
          <h2 className="h2" style={{ maxWidth: 640 }}>{c.how.title}</h2>
          <div className="grid-fit" style={{ gap: 20, marginTop: 48 }}>
            {c.how.steps.slice(0, 3).map((s, i) => (
              <div key={i} className="card">
                <div className="art" aria-hidden="true">{STEP_ART[i]}</div>
                <div>
                  <div className="step-no">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-text">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONES */}
      <section id="zones" className="anchor band-white">
        <div className="wrap section">
          <div className="zones-head">
            <div>
              <div className="kicker">{c.zones.kicker}</div>
              <h2 className="h2">{c.zones.title}</h2>
            </div>
            <p className="lead">{c.zones.lead}</p>
          </div>
          <ZonesDemo zones={zones} />
        </div>
      </section>

      {/* BEACON */}
      <section id="beacon" className="anchor">
        <div className="wrap section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 56, alignItems: "center" }}>
          <div className="feature">
            <div className="ring ring-beacon" />
            <div className="ring ring-beacon" style={{ animationDelay: "1s" }} />
            <div className="ring ring-beacon" style={{ animationDelay: "2s" }} />
            {c.beacon.imageKey ? (
              <img className="product-photo" src={imgSrc(c.beacon.imageKey, 900)} srcSet={imgSrcSet(c.beacon.imageKey)} sizes="(max-width: 700px) 80vw, 340px" alt={c.beacon.imageAlt} />
            ) : (
              <div className="product-tile" role="img" aria-label={c.beacon.imageAlt}>
                <Beacon w={80} h={94} radius={24} border={3} dot={22} />
              </div>
            )}
            <div className="feature-caption">{c.beacon.caption}</div>
          </div>
          <div>
            <div className="kicker">{c.beacon.kicker}</div>
            <h2 className="h2">{c.beacon.title}</h2>
            <p className="lead" style={{ marginTop: 16, maxWidth: 500 }}>{c.beacon.lead}</p>
            <div className="grid-fit" style={{ "--min": "210px", gap: "26px 28px", marginTop: 34 } as React.CSSProperties}>
              {c.beacon.specs.map((s, i) => (
                <div key={i}>
                  <div className="spec-mark" />
                  <h3 className="spec-title">{s.title}</h3>
                  <p className="spec-text">{s.text}</p>
                </div>
              ))}
            </div>
            <a href="#shop" className="btn btn-secondary" style={{ marginTop: 36, padding: "13.5px 24px", fontSize: 15 }}>{c.beacon.cta}</a>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="anchor shop-band">
        <div className="wrap section">
          <div className="kicker">{c.shop.kicker}</div>
          <h2 className="h2">{c.shop.title}</h2>
          <p className="lead" style={{ marginTop: 12, maxWidth: "none" }}>{c.shop.lead}</p>
          <Shop packs={packs} stock={stock} note={fill(c.shop.note, { shipTimes: c.shipping.times })} soldOut={c.shop.soldOut} />
        </div>
      </section>

      {/* APP */}
      <section style={{ padding: "0 24px" }}>
        <div className="app-card">
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <h2 style={{ font: "700 clamp(30px, 3.6vw, 44px)/1.1 var(--font-head)", letterSpacing: -0.6, textWrap: "balance" }}>{c.app.title}</h2>
            <p className="lead" style={{ marginTop: 14 }}>{c.app.text}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
              <StoreButton href={c.app.iosUrl} platform="iPhone" />
              <StoreButton href={c.app.androidUrl} platform="Android" />
            </div>
          </div>
          <div style={{ flex: "0 0 auto" }}><AppIcon size={150} shadow /></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="anchor">
        <div className="wrap two-col" style={{ paddingBottom: 96 }}>
          <div>
            <div className="kicker">{c.faq.kicker}</div>
            <h2 className="h2">{c.faq.title}</h2>
          </div>
          <Faq items={faq} />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="anchor" style={{ background: "#fff", borderTop: "1px solid var(--border-soft)" }}>
        <div className="wrap two-col" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div>
            <div className="kicker">{c.contact.kicker}</div>
            <h2 className="h2">{c.contact.title}</h2>
            <p className="lead" style={{ marginTop: 14, maxWidth: 420 }}>{c.contact.lead}</p>
          </div>
          <div className="grid-fit" style={{ "--min": "220px", gap: 14 } as React.CSSProperties}>
            <div className="info-card">
              <div className="info-label">Company</div>
              <div className="info-title">{b.brand}</div>
              <div className="info-text">{b.street}<br />{b.postcode} {b.city}<br />{b.country}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Phone</div>
              <a className="info-title" href={telHref(b.phone)}>{b.phone}</a>
              {b.email && (
                <>
                  <div className="info-label" style={{ marginTop: 18 }}>Email</div>
                  <a className="info-title" href={`mailto:${b.email}`}>{b.email}</a>
                </>
              )}
              <div className="info-label" style={{ marginTop: 18 }}>Registration</div>
              <div className="info-text" style={{ marginTop: 6 }}>KvK {b.kvk}<br />VAT {b.vat}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StoreButton({ href, platform }: { href: string; platform: string }) {
  const inner = <><span className="s1">{href ? "Download for" : "Coming soon for"}</span><span className="s2">{platform}</span></>;
  return href ? (
    <a className="btn-store" href={href} target="_blank" rel="noreferrer">{inner}</a>
  ) : (
    <span className="btn-store" aria-disabled="true">{inner}</span>
  );
}

const STEP_ART = [
  <>
    <div className="ring ring-art" />
    <div className="ring ring-art" style={{ animationDelay: "1.3s" }} />
    <span style={{ position: "relative", zIndex: 2 }}><Beacon w={52} h={60} radius={14} dot={14} bg="#fff" /></span>
  </>,
  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
    <Beacon w={44} h={56} radius={12} dot={10} />
    <div style={{ width: 36, height: 44, borderRadius: 10, background: "#fff", border: "2px solid var(--blue)" }} />
  </div>,
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div className="float" style={{ width: 30, height: 36, borderRadius: 9, background: "var(--sand)", border: "2px solid var(--coral)" }} />
    <div style={{ display: "flex", gap: 8 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--coral)" }} />
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--amber)" }} />
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#cfd8dd" }} />
    </div>
    <div style={{ width: 22, height: 30, border: "2.5px solid #b9ac97", borderRadius: 5, background: "#fff" }} />
  </div>,
];
