import { db } from "@/lib/db";
import { deleteFaq, moveFaq, saveFaq } from "@/app/admin/actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { ActionButton } from "@/components/admin/ActionButton";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function FaqPage() {
  const items = await db.faqItem.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
  const nextSort = (items.at(-1)?.sort ?? -1) + 1;
  return (
    <>
      <div className="admin-head"><h1>FAQ</h1><span className="help">Shown on the home page in this order. The first one starts open.</span></div>
      {items.map((f, i) => (
        <ActionForm key={f.id} action={saveFaq} className="panel form-grid">
          <input type="hidden" name="id" value={f.id} />
          <input type="hidden" name="sort" value={f.sort} />
          <label className="field"><span>Question</span><input className="input input-sm" name="question" defaultValue={f.question} required /></label>
          <label className="field"><span>Answer</span><textarea className="textarea" name="answer" rows={3} defaultValue={f.answer} required /></label>
          <div className="actions">
            <label className="check-row"><input type="checkbox" name="active" defaultChecked={f.active} /><span>Shown</span></label>
            <SubmitButton className="btn btn-ink btn-xs">Save</SubmitButton>
            <ActionButton action={moveFaq.bind(null, f.id, -1)} className="btn btn-secondary btn-xs">↑</ActionButton>
            <ActionButton action={moveFaq.bind(null, f.id, 1)} className="btn btn-secondary btn-xs">↓</ActionButton>
            <ActionButton action={deleteFaq.bind(null, f.id)} confirmText="Delete this question?" className="link-underline">delete</ActionButton>
            <span className="help">#{i + 1}</span>
          </div>
        </ActionForm>
      ))}
      <ActionForm action={saveFaq} className="panel form-grid" style={{ background: "var(--sand)" }}>
        <h2>Add a question</h2>
        <input type="hidden" name="sort" value={nextSort} />
        <label className="field"><span>Question</span><input className="input input-sm" name="question" required /></label>
        <label className="field"><span>Answer</span><textarea className="textarea" name="answer" rows={3} required /></label>
        <input type="hidden" name="active" value="on" />
        <div><SubmitButton className="btn btn-primary btn-xs">Add</SubmitButton></div>
      </ActionForm>
    </>
  );
}
