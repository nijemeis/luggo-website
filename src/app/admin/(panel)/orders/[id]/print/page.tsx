import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getContent, addressLine } from "@/lib/content";
import { money } from "@/lib/money";
import { countryName } from "@/lib/shipping";
import { fmtDate } from "@/lib/admin-format";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = { title: "Packing slip" };

/** Printable packing slip that doubles as the invoice (VAT shown per line and in total). */
export default async function PrintOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, c] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true } }), getContent()]);
  if (!order) notFound();
  const b = c.business;
  const rate = b.vatRate;
  const ex = (gross: number) => Math.round(gross / (1 + rate / 100));
  const units = order.items.reduce((s, i) => s + i.units * i.qty, 0);
  return (
    <div className="print-sheet" style={{ background: "#fff", maxWidth: 780, margin: "0 auto", padding: 36, borderRadius: 20, font: "500 14px/1.5 var(--font-body)" }}>
      <style>{`@media print { .admin-side, .no-print { display: none !important } .admin { display: block } .admin-main { padding: 0 } .print-sheet { box-shadow: none; padding: 0 } body { background: #fff } }`}</style>
      <div className="no-print" style={{ marginBottom: 18 }}><PrintButton /></div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ font: "700 26px var(--font-head)" }}>Luggo</div>
          <div>{b.brand}<br />{addressLine(b)}<br />KvK {b.kvk} · VAT {b.vat}{b.email ? <><br />{b.email}</> : null}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ font: "700 20px var(--font-head)" }}>Invoice &amp; packing slip</div>
          <div>Number <strong>{order.number}</strong><br />Date {fmtDate.format(order.paidAt ?? order.createdAt)}</div>
        </div>
      </div>
      <div style={{ marginTop: 28, padding: 16, border: "1px solid var(--border)", borderRadius: 14 }}>
        <div className="info-label">Ship to</div>
        <div style={{ font: "600 16px/1.5 var(--font-body)", marginTop: 6 }}>
          {order.firstName} {order.lastName}<br />{order.street} {order.houseNo}<br />{order.postcode} {order.city}<br />{countryName(order.country)}
        </div>
      </div>
      <table className="table" style={{ marginTop: 24 }}>
        <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Beacons</th><th className="num">Unit incl. VAT</th><th className="num">Total incl. VAT</th></tr></thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}><td>Luggo {i.name}</td><td className="num">{i.qty}</td><td className="num">{i.units * i.qty}</td><td className="num">{money(i.unitPriceCents)}</td><td className="num">{money(i.unitPriceCents * i.qty)}</td></tr>
          ))}
          <tr><td colSpan={4}>Shipping — {order.zoneName}</td><td className="num">{money(order.shippingCents)}</td></tr>
        </tbody>
      </table>
      <div style={{ marginLeft: "auto", maxWidth: 320, marginTop: 16, display: "grid", gap: 6 }}>
        <div className="sum-row"><span>Total excl. VAT</span><span>{money(order.totalCents - order.vatCents)}</span></div>
        <div className="sum-row"><span>VAT {rate}%</span><span>{money(order.vatCents)}</span></div>
        <div className="sum-total"><span style={{ font: "700 15px var(--font-body)" }}>Total</span><span style={{ fontSize: 22 }}>{money(order.totalCents)}</span></div>
        <div className="help">{order.paidAt ? `Paid ${fmtDate.format(order.paidAt)}${order.paymentMethod ? ` via ${order.paymentMethod}` : ""}` : "Not paid"}</div>
      </div>
      <div style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid var(--border)", font: "600 14px/1.5 var(--font-body)" }}>
        Packing check: {units} beacon{units === 1 ? "" : "s"} in this parcel. ☐
        <div className="help" style={{ marginTop: 6 }}>Pair your beacons in the free Luggo app: open Luggo, tap “Pair a new bag” and hold the beacon against the back of your phone.</div>
      </div>
      <div className="help" style={{ marginTop: 14 }}>Unit prices include {rate}% Dutch VAT; ex-VAT per unit: {order.items.map((i) => `${i.name} ${money(ex(i.unitPriceCents))}`).join(" · ")}.</div>
    </div>
  );
}
