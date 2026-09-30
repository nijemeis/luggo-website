import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/money";
import { NEXT_STATUS, type OrderStatus } from "@/lib/orders";
import { CARRIERS, carrierLabel, countryName, trackingUrl } from "@/lib/shipping";
import { stripeEnabled } from "@/lib/stripe";
import { fmtDateTime, statusStyle, statusText } from "@/lib/admin-format";
import { addOrderNote, changeOrderStatus, updateShipping } from "@/app/admin/actions/orders";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, events: { orderBy: { createdAt: "asc" } } } });
  if (!order) notFound();
  const status = order.status as OrderStatus;
  const nexts = NEXT_STATUS[status] ?? [];
  const units = order.items.reduce((s, i) => s + i.units * i.qty, 0);
  const link = trackingUrl(order.carrier, order.trackingCode, order.postcode, order.country);
  const carrierSelect = (
    <select className="select input-sm" name="carrier" defaultValue={order.carrier || "postnl"}>
      {CARRIERS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
    </select>
  );

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="crumbs"><Link href="/admin/orders">Orders</Link><span>/</span><span className="here">{order.number}</span></div>
          <h1 style={{ marginTop: 8 }}>{order.number} <span className="status" style={{ ...statusStyle(status), verticalAlign: "middle", marginLeft: 8, fontSize: 13 }}>{statusText(status)}</span></h1>
        </div>
        <div className="actions">
          <a className="btn btn-secondary btn-xs" href={`/admin/orders/${order.id}/print`} target="_blank" rel="noreferrer">Packing slip &amp; invoice</a>
          <a className="btn btn-secondary btn-xs" href={`mailto:${order.email}?subject=${encodeURIComponent(`Your Luggo order ${order.number}`)}`}>Email customer</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16, alignItems: "start" }}>
        <div>
          <div className="panel">
            <h2>Packs</h2>
            <table className="table">
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td><strong>{i.name}</strong><div className="help">{i.units} beacon{i.units === 1 ? "" : "s"} per pack</div></td>
                    <td className="num">{i.qty} × {money(i.unitPriceCents)}</td>
                    <td className="num"><strong>{money(i.unitPriceCents * i.qty)}</strong></td>
                  </tr>
                ))}
                <tr><td colSpan={2} className="num">Shipping — {order.zoneName}</td><td className="num">{order.shippingCents ? money(order.shippingCents) : "free"}</td></tr>
                <tr><td colSpan={2} className="num"><strong>Total</strong> <span className="help">incl. {money(order.vatCents)} VAT</span></td><td className="num"><strong>{money(order.totalCents)}</strong></td></tr>
              </tbody>
            </table>
            <p className="help" style={{ marginTop: 10 }}>{units} beacons to pack.</p>
          </div>

          <div className="panel">
            <h2>Customer &amp; address</h2>
            <div style={{ font: "500 15px/1.6 var(--font-body)" }}>
              <strong>{order.firstName} {order.lastName}</strong><br />
              {order.street} {order.houseNo}<br />
              {order.postcode} {order.city}<br />
              {countryName(order.country)}<br />
              <a href={`mailto:${order.email}`} style={{ textDecoration: "underline" }}>{order.email}</a>
              {order.phone && <><br /><a href={`tel:${order.phone.replace(/[^+\d]/g, "")}`}>{order.phone}</a></>}
            </div>
            <div className="help" style={{ marginTop: 10 }}>
              Placed {fmtDateTime.format(order.createdAt)}{order.paidAt ? ` · paid ${fmtDateTime.format(order.paidAt)}${order.paymentMethod ? ` via ${order.paymentMethod}` : ""}` : ""}
              {order.pspPaymentId && <> · <a href={`https://dashboard.stripe.com/payments/${order.pspPaymentId}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>Stripe payment</a></>}
            </div>
          </div>

          <div className="panel">
            <h2>History</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {order.events.map((e) => (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 10, font: "500 14px/1.4 var(--font-body)" }}>
                  <span className="help">{fmtDateTime.format(e.createdAt)}</span>
                  <span><strong>{statusText(e.status)}</strong>{e.note ? ` — ${e.note}` : ""}{e.internal ? <span className="help"> (internal)</span> : null}</span>
                </div>
              ))}
            </div>
            <ActionForm action={addOrderNote.bind(null, order.id)} style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input className="input input-sm" name="note" placeholder="Internal note (not emailed)" />
              <SubmitButton className="btn btn-secondary btn-xs">Add note</SubmitButton>
            </ActionForm>
          </div>
        </div>

        <div>
          {nexts.length > 0 && (
            <div className="panel">
              <h2>Update status</h2>
              <ActionForm action={changeOrderStatus.bind(null, order.id)} className="form-grid">
                <label className="field"><span>New status</span>
                  <select className="select input-sm" name="status" defaultValue={nexts[0]}>
                    {nexts.map((s) => <option key={s} value={s}>{statusText(s)}</option>)}
                  </select>
                </label>
                {nexts.includes("shipped") && (
                  <div className="form-2">
                    <label className="field"><span>Carrier (when shipping)</span>{carrierSelect}</label>
                    <label className="field"><span>Tracking code (when shipping)</span><input className="input input-sm" name="trackingCode" defaultValue={order.trackingCode} placeholder="3SABCD123456789" /></label>
                  </div>
                )}
                <label className="field"><span>Note to the customer (optional, goes in the email)</span><input className="input input-sm" name="note" /></label>
                {nexts.includes("refunded") && stripeEnabled() && order.pspPaymentId && (
                  <label className="check-row"><input type="checkbox" name="stripeRefund" defaultChecked /><span>When refunding: also refund {money(order.totalCents)} through Stripe</span></label>
                )}
                <p className="help">Shipped, delivered, cancelled and refunded send the customer an email. Delivered includes the “pair your beacons” tips.</p>
                <SubmitButton className="btn btn-primary btn-xs" pendingText="Updating…">Update status</SubmitButton>
              </ActionForm>
            </div>
          )}

          {["paid", "packed", "shipped", "delivered"].includes(status) && (
            <div className="panel" style={{ background: "var(--sand)" }}>
              <h2>Tracking</h2>
              {link && <p style={{ font: "600 14px var(--font-body)", marginBottom: 12 }}><a href={link} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{carrierLabel(order.carrier)} {order.trackingCode}</a></p>}
              <ActionForm action={updateShipping.bind(null, order.id)} className="form-grid">
                <div className="form-2">
                  <label className="field"><span>Carrier</span>{carrierSelect}</label>
                  <label className="field"><span>Tracking code</span><input className="input input-sm" name="trackingCode" defaultValue={order.trackingCode} /></label>
                </div>
                <div><SubmitButton className="btn btn-ink btn-xs">Save (no email)</SubmitButton></div>
              </ActionForm>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
