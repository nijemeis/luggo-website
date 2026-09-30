import { db } from "@/lib/db";
import { getContent } from "@/lib/content";
import { fmtDate } from "@/lib/admin-format";

export default async function SubscribersPage() {
  const [subs, c] = await Promise.all([db.subscriber.findMany({ orderBy: { createdAt: "desc" } }), getContent()]);
  return (
    <>
      <div className="admin-head"><h1>Newsletter</h1><span className="help">{subs.length} subscriber{subs.length === 1 ? "" : "s"}</span></div>
      {!c.footer.newsletter && <div className="flash">The signup form is switched off. Turn it on under Settings → Footer.</div>}
      <div className="panel">
        <p className="help" style={{ marginBottom: 12 }}>Copy the list into your mail tool.</p>
        <textarea className="textarea" readOnly rows={6} value={subs.map((s) => s.email).join("\n")} style={{ fontFamily: "monospace", fontSize: 13 }} />
        <table className="table" style={{ marginTop: 14 }}>
          <thead><tr><th>Email</th><th>Joined</th></tr></thead>
          <tbody>{subs.map((s) => <tr key={s.id}><td>{s.email}</td><td>{fmtDate.format(s.createdAt)}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
