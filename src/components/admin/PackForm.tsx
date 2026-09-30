import type { Product } from "@prisma/client";
import { centsToInput } from "@/lib/money";
import { saveProduct } from "@/app/admin/actions/catalog";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";

export function PackForm({ product: p }: { product: Product | null }) {
  return (
    <ActionForm action={saveProduct} className="panel form-grid">
      {p && <input type="hidden" name="id" value={p.id} />}
      <h2>Pack</h2>
      <div className="form-2">
        <label className="field"><span>Name</span><input className="input input-sm" name="name" defaultValue={p?.name ?? ""} required placeholder="Family 3-pack" /></label>
        <label className="field"><span>Slug</span><input className="input input-sm" name="slug" defaultValue={p?.slug ?? ""} placeholder="auto from name" /></label>
      </div>
      <div className="form-3">
        <label className="field"><span>Beacons in the pack</span><input className="input input-sm" name="units" type="number" min={1} max={20} defaultValue={p?.units ?? 1} required /></label>
        <label className="field"><span>Price € (incl. VAT)</span><input className="input input-sm" name="price" inputMode="decimal" defaultValue={p ? centsToInput(p.priceCents) : ""} required placeholder="75,00" /></label>
        <label className="field"><span>Sort order</span><input className="input input-sm" name="sort" type="number" defaultValue={p?.sort ?? 0} /></label>
      </div>
      <div className="form-2">
        <label className="field"><span>Note under the price</span><input className="input input-sm" name="note" defaultValue={p?.note ?? ""} placeholder="3 beacons · save 14%" /></label>
        <label className="field"><span>Badge (empty = none)</span><input className="input input-sm" name="badge" defaultValue={p?.badge ?? ""} placeholder="Most popular" /></label>
      </div>
      <div className="actions" style={{ gap: 18 }}>
        <label className="check-row"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} /><span>On sale</span></label>
        <label className="check-row"><input type="checkbox" name="isDefault" defaultChecked={p?.isDefault ?? false} /><span>Pre-selected in the shop</span></label>
      </div>
      <div><SubmitButton className="btn btn-primary btn-xs">{p ? "Save pack" : "Create pack"}</SubmitButton></div>
    </ActionForm>
  );
}
