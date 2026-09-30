import { db } from "@/lib/db";
import { centsToInput } from "@/lib/money";
import { deleteZone, saveZone } from "@/app/admin/actions/settings";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ActionButton } from "@/components/admin/ActionButton";
import { getContent } from "@/lib/content";
import { saveContentForm } from "@/app/admin/actions/settings";

type Z = { id: string; key: string; name: string; countries: string; rateCents: number; freeFromCents: number | null; transit: string; sort: number; active: boolean };

function ZoneFields({ z }: { z?: Z }) {
  return (
    <>
      {z && <input type="hidden" name="id" value={z.id} />}
      <div className="form-3">
        <label className="field"><span>Key</span><input className="input input-sm" name="key" defaultValue={z?.key ?? ""} required placeholder="DE" /></label>
        <label className="field"><span>Name shown at checkout</span><input className="input input-sm" name="name" defaultValue={z?.name ?? ""} required placeholder="Germany" /></label>
        <label className="field"><span>Countries (ISO codes; empty = all other EU countries)</span><input className="input input-sm" name="countries" defaultValue={z?.countries ?? ""} placeholder="DE, AT" /></label>
        <label className="field"><span>Rate € per parcel</span><input className="input input-sm" name="rate" inputMode="decimal" defaultValue={z ? centsToInput(z.rateCents) : ""} required placeholder="6,95" /></label>
        <label className="field"><span>Free from € (empty = never)</span><input className="input input-sm" name="freeFrom" inputMode="decimal" defaultValue={z?.freeFromCents != null ? centsToInput(z.freeFromCents) : ""} placeholder="100,00" /></label>
        <label className="field"><span>Transit time</span><input className="input input-sm" name="transit" defaultValue={z?.transit ?? ""} placeholder="2–3 working days" /></label>
        <label className="field"><span>Sort</span><input className="input input-sm" name="sort" type="number" defaultValue={z?.sort ?? 0} /></label>
      </div>
      <div className="actions">
        <label className="check-row"><input type="checkbox" name="active" defaultChecked={z?.active ?? true} /><span>Active</span></label>
        <SubmitButton className="btn btn-ink btn-xs">{z ? "Save zone" : "Add zone"}</SubmitButton>
        {z && <ActionButton action={deleteZone.bind(null, z.id)} confirmText={`Delete zone ${z.name}?`} className="link-underline">delete</ActionButton>}
      </div>
    </>
  );
}

export default async function ShippingPage() {
  const [zones, c] = await Promise.all([db.shippingZone.findMany({ orderBy: { sort: "asc" } }), getContent()]);
  return (
    <>
      <div className="admin-head"><h1>Shipping</h1></div>
      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Delivery time on the site</h2>
        <label className="field"><span>Shown under the order bar (“Arrives in …”) and in the order confirmation</span><input className="input input-sm" name="s:shipping.times" defaultValue={c.shipping.times} /></label>
        <div><SubmitButton className="btn btn-ink btn-xs">Save</SubmitButton></div>
      </ActionForm>
      <p className="help" style={{ margin: "16px 0" }}>The checkout picks the zone from the customer’s country. The zone without countries is the fallback for the rest of the EU. Rates include VAT.</p>
      {zones.map((z) => <ActionForm key={z.id} action={saveZone} className="panel form-grid"><strong>{z.name} <span className="help">({z.key})</span></strong><ZoneFields z={z} /></ActionForm>)}
      <ActionForm action={saveZone} className="panel form-grid" style={{ background: "var(--sand)" }}><h2>Add a zone</h2><ZoneFields /></ActionForm>
    </>
  );
}
