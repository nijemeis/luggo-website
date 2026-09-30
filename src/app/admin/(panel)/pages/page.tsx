import Link from "next/link";
import { db } from "@/lib/db";
import { parseSections } from "@/lib/catalog";
import { fmtDateTime } from "@/lib/admin-format";

export default async function PagesPage() {
  const pages = await db.page.findMany({ orderBy: { slug: "asc" } });
  return (
    <>
      <div className="admin-head"><h1>Pages</h1></div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Page</th><th>URL</th><th>Sections</th><th>Status</th><th>Last edited</th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/pages/${p.slug}`}>{p.title}</Link></td>
                <td><a href={`/${p.slug}`} target="_blank" rel="noreferrer">/{p.slug}</a></td>
                <td>{parseSections(p.sections).length}</td>
                <td>{p.published ? "Published" : "Hidden"}</td>
                <td>{fmtDateTime.format(p.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
