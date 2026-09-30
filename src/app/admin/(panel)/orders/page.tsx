import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/money";
import { ORDER_STATUSES } from "@/lib/orders";
import { filterQuery, orderWhere, type OrderFilters } from "@/lib/admin-orders";
import { fmtDateTime, statusStyle, statusText } from "@/lib/admin-format";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<OrderFilters> }) {
  const f = await searchParams;
  const orders = await db.order.findMany({ where: orderWhere(f), orderBy: { createdAt: "desc" }, take: 300, include: { items: true } });
  const tabs: [string | undefined, string][] = [[undefined, "Placed"], ...ORDER_STATUSES.map((s) => [s, statusText(s)] as [string, string]), ["all", "All"]];
  return (
    <>
      <div className="admin-head">
        <h1>Orders</h1>
        <a className="btn btn-secondary btn-xs" href={`/admin/orders/export${filterQuery(f)}`}>Export CSV</a>
      </div>
      <nav className="filters" aria-label="Status">
        {tabs.map(([s, label]) => <Link key={label} href={`/admin/orders${filterQuery(f, { status: s })}`} aria-current={f.status === s ? "page" : undefined}>{label}</Link>)}
      </nav>
      <form className="panel" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end", marginBottom: 14 }}>
        {f.status && <input type="hidden" name="status" value={f.status} />}
        <label className="field" style={{ flex: "1 1 220px" }}><span>Search</span><input className="input input-sm" name="q" defaultValue={f.q} placeholder="Number, email, surname, tracking code" /></label>
        <label className="field"><span>From</span><input className="input input-sm" type="date" name="from" defaultValue={f.from} /></label>
        <label className="field"><span>To</span><input className="input input-sm" type="date" name="to" defaultValue={f.to} /></label>
        <button className="btn btn-ink btn-xs" type="submit">Filter</button>
        {(f.q || f.from || f.to) && <Link className="help" href={`/admin/orders${filterQuery({ status: f.status })}`} style={{ textDecoration: "underline" }}>clear</Link>}
      </form>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Packs</th><th>Ship to</th><th>Status</th><th className="num">Total</th><th>Placed</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
                <td>{o.firstName} {o.lastName}<div className="help">{o.email}</div></td>
                <td>{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}<div className="help">{o.items.reduce((s, i) => s + i.units * i.qty, 0)} beacons</div></td>
                <td>{o.city}<div className="help">{o.zoneName}</div></td>
                <td><span className="status" style={statusStyle(o.status)}>{statusText(o.status)}</span></td>
                <td className="num">{money(o.totalCents)}</td>
                <td>{fmtDateTime.format(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="help">Nothing here.</td></tr>}
          </tbody>
        </table>
        {orders.length === 300 && <p className="help" style={{ marginTop: 10 }}>Showing the latest 300. Narrow the dates to see older orders.</p>}
      </div>
    </>
  );
}
