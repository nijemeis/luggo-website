import Link from "next/link";
import { AppIcon } from "@/components/glyphs";
import { addressLine, type SiteContent } from "@/lib/content";
import { Newsletter } from "./Newsletter";

export function Footer({ content }: { content: SiteContent }) {
  const b = content.business;
  // "/#id" is a same-document jump on the home page and a normal link elsewhere.
  const a = (id: string) => `/#${id}`;
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AppIcon size={40} />
          <div>
            <div style={{ font: "700 19px var(--font-head)" }}>Luggo</div>
            <div style={{ font: "500 13px var(--font-body)", color: "var(--body)" }}>{content.footer.tagline}</div>
          </div>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href={a("how")}>How it works</a>
          <a href={a("beacon")}>The beacon</a>
          <a href={a("shop")}>Shop</a>
          <a href={a("faq")}>FAQ</a>
          <a href={a("contact")}>Contact</a>
          <Link href="/track">Track order</Link>
          <Link href="/shipping">Shipping &amp; returns</Link>
          <Link href="/privacy">Privacy statement</Link>
        </nav>
        {content.footer.newsletter && (
          <div className="newsletter">
            <div>
              <div style={{ font: "700 17px var(--font-head)" }}>{content.footer.newsletterHead}</div>
              <div style={{ font: "500 14px/1.5 var(--font-body)", color: "var(--body)", marginTop: 2 }}>{content.footer.newsletterText}</div>
            </div>
            <Newsletter />
          </div>
        )}
        <div className="legal">
          <span>&copy; {new Date().getFullYear()} {b.brand}</span>
          <span>{addressLine(b)}</span>
          <span>{b.phone}</span>
          {b.email && <span>{b.email}</span>}
          <span>KvK {b.kvk}</span>
          <span>VAT {b.vat}</span>
          {content.footer.paymentLine && <span>{content.footer.paymentLine}</span>}
          {content.footer.socials.filter((s) => s.url).map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{ color: "var(--body)", textDecoration: "underline", textUnderlineOffset: 3 }}>{s.label}</a>)}
        </div>
      </div>
    </footer>
  );
}
