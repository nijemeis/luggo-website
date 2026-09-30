import { getContent } from "@/lib/content";
import { saveContentForm } from "@/app/admin/actions/settings";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageSlot } from "@/components/admin/ImageSlot";
import { Text } from "@/components/admin/Fields";

const Save = () => <div><SubmitButton className="btn btn-ink btn-xs">Save section</SubmitButton></div>;

export default async function ContentPage() {
  const c = await getContent();
  return (
    <>
      <div className="admin-head"><h1>Homepage copy</h1><span className="help">Packs live under Packs &amp; stock, questions under FAQ.</span></div>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Hero</h2>
        <div className="form-2">
          <Text name="hero.pill" label="Pill" value={c.hero.pill} />
          <Text name="hero.headline" label="Headline" value={c.hero.headline} />
        </div>
        <Text name="hero.lead" label="Lead" value={c.hero.lead} rows={3} />
        <div className="form-3">
          <Text name="hero.primaryCta" label="Primary button" value={c.hero.primaryCta} help="{fromPrice} = cheapest pack" />
          <Text name="hero.secondaryCta" label="Secondary button" value={c.hero.secondaryCta} />
          <Text name="hero.small" label="Small line" value={c.hero.small} />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>How it works</h2>
        <div className="form-2">
          <Text name="how.kicker" label="Kicker" value={c.how.kicker} />
          <Text name="how.title" label="Title" value={c.how.title} />
        </div>
        {c.how.steps.map((s, i) => (
          <div key={i} className="form-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }}>
            <Text name={`how.steps.${i}.title`} label={`Step ${i + 1} title`} value={s.title} />
            <Text name={`how.steps.${i}.text`} label={`Step ${i + 1} text`} value={s.text} rows={2} />
          </div>
        ))}
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Zones (also used on the phone in the hero)</h2>
        <div className="form-2">
          <Text name="zones.kicker" label="Kicker" value={c.zones.kicker} />
          <Text name="zones.title" label="Title" value={c.zones.title} />
        </div>
        <Text name="zones.lead" label="Lead" value={c.zones.lead} rows={2} />
        {(["far", "med", "near", "here"] as const).map((k) => (
          <div key={k} className="form-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }}>
            <Text name={`zones.${k}.title`} label={`${k === "med" ? "Medium" : k[0].toUpperCase() + k.slice(1)} — title`} value={c.zones[k].title} />
            <Text name={`zones.${k}.copy`} label="Text ({bag} = bag name)" value={c.zones[k].copy} />
          </div>
        ))}
        <Save />
      </ActionForm>

      <div className="panel form-grid">
        <h2>The beacon — photo</h2>
        <ImageSlot slot="beacon" imageKey={c.beacon.imageKey} help="Square works best. Replaces the beacon glyph in the product card; the pulsing rings stay." />
      </div>
      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>The beacon — copy</h2>
        <div className="form-3">
          <Text name="beacon.kicker" label="Kicker" value={c.beacon.kicker} />
          <Text name="beacon.caption" label="Caption on the card" value={c.beacon.caption} />
          <Text name="beacon.imageAlt" label="Photo description (alt text)" value={c.beacon.imageAlt} />
        </div>
        <Text name="beacon.title" label="Title" value={c.beacon.title} />
        <Text name="beacon.lead" label="Lead" value={c.beacon.lead} rows={2} />
        {[...c.beacon.specs, { title: "", text: "" }].map((s, i) => (
          <div key={i} className="form-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }}>
            <Text name={`beacon.specs.${i}.title`} label={s.title ? `Spec ${i + 1}` : "Add a spec"} value={s.title} />
            <Text name={`beacon.specs.${i}.text`} label="Text" value={s.text} />
          </div>
        ))}
        <Text name="beacon.cta" label="Button" value={c.beacon.cta} />
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Shop</h2>
        <div className="form-3">
          <Text name="shop.kicker" label="Kicker" value={c.shop.kicker} />
          <Text name="shop.title" label="Title" value={c.shop.title} />
          <Text name="shop.lead" label="Lead" value={c.shop.lead} />
        </div>
        <div className="form-2">
          <Text name="shop.note" label="Line under the order bar" value={c.shop.note} help="{shipTimes} = delivery time from Shipping" />
          <Text name="shop.soldOut" label="Sold-out message" value={c.shop.soldOut} />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>App card, FAQ &amp; contact headings</h2>
        <Text name="app.title" label="App card title" value={c.app.title} />
        <Text name="app.text" label="App card text" value={c.app.text} rows={2} />
        <div className="form-2">
          <Text name="faq.kicker" label="FAQ kicker" value={c.faq.kicker} />
          <Text name="faq.title" label="FAQ title" value={c.faq.title} />
          <Text name="contact.kicker" label="Contact kicker" value={c.contact.kicker} />
          <Text name="contact.title" label="Contact title" value={c.contact.title} />
        </div>
        <Text name="contact.lead" label="Contact lead" value={c.contact.lead} rows={2} />
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>After the order</h2>
        <div className="form-2">
          <Text name="confirmation.title" label="Confirmation title" value={c.confirmation.title} />
          <Text name="confirmation.text" label="Confirmation text (also in the email)" value={c.confirmation.text} help="{units} = “3 Luggo beacons”, {shipTimes} = delivery time" />
          <Text name="track.title" label="Track page title" value={c.track.title} />
          <Text name="track.help" label="Track page help line" value={c.track.help} />
        </div>
        <Text name="track.lead" label="Track page lead" value={c.track.lead} rows={2} />
        <Save />
      </ActionForm>
    </>
  );
}
