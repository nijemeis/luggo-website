import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/money";
import { getStock } from "@/lib/catalog";
import { saveStock, toggleProduct } from "@/app/admin/actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function ProductsPage() {
  const [packs, stock] = await Promise.all([db.product.findMany({ orderBy: [{ sort: "asc" }, { units: "asc" }], include: { _count: { select: { orderItems: true } } } }), getStock()]);
  return (
    <>
      <div className="admin-head"><h1>Packs &amp; stock</h1><Link href="/admin/products/new" className="btn btn-primary btn-xs">+ New pack</Link></div>
      <ActionForm action={saveStock} className="panel form-grid">
        <h2>Beacon stock</h2>
        <p className="help">Counted in beacons, shared by all packs. Paid orders take beacons off; cancelling an unshipped order puts them back. Packs that need more beacons than are left show as sold out. Leave empty to stop tracking stock.</p>
        <div className="actions">
          <input className="input input-sm" name="stock" type="number" min={0} defaultValue={stock ?? ""} placeholder="not tracked" style={{ width: 160 }} aria-label="Beacons in stock" />
          <SubmitButton className="btn btn-ink btn-xs">Save stock</SubmitButton>
        </div>
      </ActionForm>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead><tr><th>Pack</th><th className="num">Beacons</th><th className="num">Price</th><th className="num">Per beacon</th><th>Badge</th><th>Orders</th><th>Status</th></tr></thead>
          <tbody>
            {packs.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/products/${p.id}`}>{p.name}</Link>{p.isDefault && <span className="help"> · pre-selected</span>}<div className="help">{p.note}</div></td>
                <td className="num">{p.units}</td>
                <td className="num">{money(p.priceCents)}</td>
                <td className="num">{money(Math.round(p.priceCents / p.units))}</td>
                <td>{p.badge || "—"}</td>
                <td>{p._count.orderItems}</td>
                <td><form action={toggleProduct.bind(null, p.id, !p.active)}><button type="submit" className="status" style={p.active ? { background: "var(--success-bg)", color: "#3f7a4f" } : { background: "var(--sand)", color: "var(--body)" }}>{p.active ? "On sale" : "Hidden"}</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
