import { Fragment } from "react";
import type { PageSection } from "@/lib/catalog";
import { telHref } from "@/lib/content";

/** Turns phone numbers, email addresses and URLs in plain CMS text into links. */
function linkify(text: string): React.ReactNode[] {
  const re = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+|\+\d[\d ]{7,}\d)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const [hit] = m;
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const href = hit.startsWith("http") ? hit : hit.includes("@") ? `mailto:${hit}` : telHref(hit);
    out.push(<a key={i} href={href}>{hit}</a>);
    last = i + hit.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function CmsPage({ page }: { page: { kicker: string; title: string; intro: string; updatedOn: string; sections: PageSection[] } }) {
  return (
    <main className="wrap" style={{ paddingTop: 72, paddingBottom: 96, display: "flex", flexWrap: "wrap", gap: "40px 72px", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        {page.kicker && <div className="kicker">{page.kicker}</div>}
        <h1 className="page-title">{page.title}</h1>
        {page.intro && <p className="lead" style={{ marginTop: 16, maxWidth: 360 }}>{page.intro}</p>}
        {page.updatedOn && <div style={{ marginTop: 18, font: "600 13.5px var(--font-body)", color: "var(--muted)" }}>Last updated {page.updatedOn}</div>}
      </div>
      <div style={{ flex: "2 1 480px", minWidth: 0, maxWidth: 720, display: "flex", flexDirection: "column", gap: 14 }}>
        {page.sections.map((s, i) => (
          <section key={i} className="panel-w prose">
            <h2 className="panel-title" style={{ marginBottom: 10 }}>{s.heading}</h2>
            {s.body.split(/\n\s*\n/).map((para, j) => <p key={j}>{para.split("\n").map((line, k) => <Fragment key={k}>{k > 0 && <br />}{linkify(line)}</Fragment>)}</p>)}
          </section>
        ))}
      </div>
    </main>
  );
}
