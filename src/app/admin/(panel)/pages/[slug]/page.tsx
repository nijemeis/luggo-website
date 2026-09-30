import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseSections } from "@/lib/catalog";
import { savePage } from "@/app/admin/actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await db.page.findUnique({ where: { slug } });
  if (!page) notFound();
  // Two empty rows at the end to add sections; empty rows are dropped on save.
  const sections = [...parseSections(page.sections), { heading: "", body: "" }, { heading: "", body: "" }];
  return (
    <>
      <div className="admin-head">
        <div><div className="crumbs"><Link href="/admin/pages">Pages</Link><span>/</span><span className="here">{page.title}</span></div><h1 style={{ marginTop: 8 }}>{page.title}</h1></div>
        <a className="btn btn-secondary btn-xs" href={`/${page.slug}`} target="_blank" rel="noreferrer">View page</a>
      </div>
      <ActionForm action={savePage} className="form-grid">
        <input type="hidden" name="id" value={page.id} />
        <div className="panel form-grid">
          <div className="form-3">
            <label className="field"><span>Kicker</span><input className="input input-sm" name="kicker" defaultValue={page.kicker} /></label>
            <label className="field"><span>Title</span><input className="input input-sm" name="title" defaultValue={page.title} required /></label>
            <label className="field"><span>“Last updated” date</span><input className="input input-sm" name="updatedOn" defaultValue={page.updatedOn} placeholder="30 September 2026" /></label>
          </div>
          <label className="field"><span>Intro</span><textarea className="textarea" name="intro" rows={2} defaultValue={page.intro} /></label>
          <label className="check-row"><input type="checkbox" name="published" defaultChecked={page.published} /><span>Published</span></label>
        </div>
        {sections.map((s, i) => (
          <div key={i} className="panel form-grid" style={!s.heading && !s.body ? { background: "var(--sand)" } : undefined}>
            <label className="field"><span>{s.heading || s.body ? `Section ${i + 1} heading` : "New section heading"}</span><input className="input input-sm" name={`heading.${i}`} defaultValue={s.heading} /></label>
            <label className="field"><span>Text — leave a blank line between paragraphs. Phone numbers, emails and links become clickable.</span><textarea className="textarea" name={`body.${i}`} rows={Math.max(3, Math.ceil(s.body.length / 90))} defaultValue={s.body} /></label>
          </div>
        ))}
        <p className="help">Clear both fields of a section to remove it.</p>
        <div><SubmitButton className="btn btn-primary btn-xs">Save page</SubmitButton></div>
      </ActionForm>
    </>
  );
}
