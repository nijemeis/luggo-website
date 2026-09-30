import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/money";
import { getStock } from "@/lib/catalog";
import { stripeEnabled } from "@/lib/stripe";
import { fmtDateTime, statusStyle, statusText } from "@/lib/admin-format";

export default async function Dashboard() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [toPack, toShip, recent, revenue, beacons, stock, stalePending] = await Promise.all([
    db.order.count({ where: { status: "paid" } }),
    db.order.count({ where: { status: "packed" } }),
    db.order.findMany({ where: { status: { not: "pending_payment" } }, orderBy: { createdAt: "desc" }, take: 8, include: { items: true } }),
    db.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { paidAt: { gte: since }, status: { notIn: ["pending_payment", "cancelled", "refunded"] } } }),
    db.orderItem.findMany({ where: { order: { paidAt: { gte: since }, status: { notIn: ["pending_payment", "cancelled", "refunded"] } } }, select: { units: true, qty: true } }),
    getStock(),
    db.order.count({ where: { status: "pending_payment", createdAt: { lt: new Date(Date.now() - 2 * 3600_000) } } }),
  ]);
  const soldUnits = beacons.reduce((s, i) => s + i.units * i.qty, 0);
  return (
    <>
      <div className="admin-head"><h1>Good to see you.</h1></div>
      {!stripeEnabled() && <div className="flash">Stripe isn’t configured, so checkout runs in mock mode and marks orders paid straight away. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET before launch.</div>}
      {stock != null && stock < 10 && <div className="flash flash-err">Only {stock} beacon{stock === 1 ? "" : "s"} left in stock. <Link href="/admin/products" style={{ textDecoration: "underline" }}>Update stock</Link></div>}
      <div className="kpi">
        <Link href="/admin/orders?status=paid" className="panel"><div className="v">{toPack}</div><div className="l">paid, to pack</div></Link>
        <Link href="/admin/orders?status=packed" className="panel"><div className="v">{toShip}</div><div className="l">packed, to ship</div></Link>
        <div className="panel"><div className="v">{money(revenue._sum.totalCents ?? 0)}</div><div className="l">{revenue._count} orders in the last 30 days</div></div>
        <div className="panel"><div className="v">{soldUnits}</div><div className="l">beacons sold in 30 days</div></div>
        <Link href="/admin/products" className="panel"><div className="v">{stock ?? "—"}</div><div className="l">{stock == null ? "stock not tracked" : "beacons in stock"}</div></Link>
      </div>
      {stalePending > 0 && <div className="flash" style={{ marginTop: 16 }}>{stalePending} checkout{stalePending > 1 ? "s were" : " was"} started but never paid. They expire by themselves; <Link href="/admin/orders?status=pending_payment" style={{ textDecoration: "underline" }}>review them</Link> if a customer says they paid.</div>}
      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Latest orders</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Beacons</th><th>Status</th><th className="num">Total</th><th>Placed</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
                  <td>{o.firstName} {o.lastName}<div className="help">{o.city}, {o.country}</div></td>
                  <td>{o.items.reduce((s, i) => s + i.units * i.qty, 0)}</td>
                  <td><span className="status" style={statusStyle(o.status)}>{statusText(o.status)}</span></td>
                  <td className="num">{money(o.totalCents)}</td>
                  <td>{fmtDateTime.format(o.createdAt)}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={6} className="help">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
