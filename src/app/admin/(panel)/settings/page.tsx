import { getContent } from "@/lib/content";
import { saveContentForm } from "@/app/admin/actions/settings";
import { stripeEnabled } from "@/lib/stripe";
import { storageConfigured } from "@/lib/storage";
import { ActionForm } from "@/components/admin/ActionForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageSlot } from "@/components/admin/ImageSlot";
import { Bool, Num, Text } from "@/components/admin/Fields";

const Save = () => <div><SubmitButton className="btn btn-ink btn-xs">Save</SubmitButton></div>;

export default async function SettingsPage() {
  const c = await getContent();
  const b = c.business;
  return (
    <>
      <div className="admin-head"><h1>Settings</h1></div>

      <div className="panel">
        <h2>System</h2>
        <table className="table">
          <tbody>
            <tr><td>Payments</td><td>{stripeEnabled() ? "Stripe" : "Mock mode (no STRIPE_SECRET_KEY)"}</td></tr>
            <tr><td>Stripe webhook secret</td><td>{process.env.STRIPE_WEBHOOK_SECRET ? "set" : "missing"}</td></tr>
            <tr><td>Email</td><td>{process.env.RESEND_API_KEY ? `Resend, from ${process.env.EMAIL_FROM || "default"}` : "Printed to the server log (no RESEND_API_KEY)"}</td></tr>
            <tr><td>New-order notifications</td><td>{process.env.SHOP_NOTIFY_EMAIL || "off (SHOP_NOTIFY_EMAIL empty)"}</td></tr>
            <tr><td>File storage</td><td>{process.env.S3_BUCKET ? `Spaces bucket ${process.env.S3_BUCKET}` : storageConfigured() ? "Local disk (development)" : "Missing — uploads will fail"}</td></tr>
          </tbody>
        </table>
      </div>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Announcement bar</h2>
        <div className="form-2">
          <Text name="announcement.text" label="Text (empty = hidden)" value={c.announcement.text} placeholder="Free shipping in the Netherlands this week" />
          <Text name="announcement.link" label="Link (optional)" value={c.announcement.link} placeholder="/#shop" />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Company &amp; contact</h2>
        <div className="form-3">
          <Text name="business.brand" label="Trading name" value={b.brand} />
          <Text name="business.company" label="Company" value={b.company} />
          <Text name="business.phone" label="Phone" value={b.phone} />
          <Text name="business.email" label="Contact email (empty = hidden)" value={b.email} placeholder="hello@luggo.net" />
          <Text name="business.street" label="Street" value={b.street} />
          <Text name="business.postcode" label="Postcode" value={b.postcode} />
          <Text name="business.city" label="City" value={b.city} />
          <Text name="business.country" label="Country" value={b.country} />
          <Text name="business.kvk" label="KvK" value={b.kvk} />
          <Text name="business.vat" label="VAT number" value={b.vat} />
          <Num name="business.vatRate" label="VAT rate %" value={b.vatRate} />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>App store links</h2>
        <div className="form-2">
          <Text name="app.iosUrl" label="App Store URL" value={c.app.iosUrl} placeholder="https://apps.apple.com/app/…" help="Empty = the button says “Coming soon”" />
          <Text name="app.androidUrl" label="Google Play URL" value={c.app.androidUrl} placeholder="https://play.google.com/store/apps/details?id=…" />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Footer</h2>
        <div className="form-2">
          <Text name="footer.tagline" label="Tagline" value={c.footer.tagline} />
          <Text name="footer.paymentLine" label="Payment methods line" value={c.footer.paymentLine} />
        </div>
        {[...c.footer.socials, { label: "", url: "" }].map((s, i) => (
          <div key={i} className="form-2" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }}>
            <Text name={`footer.socials.${i}.label`} label={s.label ? "Social link" : "Add a social link"} value={s.label} placeholder="Instagram" />
            <Text name={`footer.socials.${i}.url`} label="URL" value={s.url} placeholder="https://instagram.com/…" />
          </div>
        ))}
        <Bool name="footer.newsletter" label="Show the newsletter signup in the footer" checked={c.footer.newsletter} />
        <div className="form-2">
          <Text name="footer.newsletterHead" label="Newsletter heading" value={c.footer.newsletterHead} />
          <Text name="footer.newsletterText" label="Newsletter text" value={c.footer.newsletterText} />
        </div>
        <Save />
      </ActionForm>

      <ActionForm action={saveContentForm} className="panel form-grid">
        <h2>Search &amp; sharing</h2>
        <Text name="seo.title" label="Page title" value={c.seo.title} />
        <Text name="seo.description" label="Description" value={c.seo.description} rows={2} />
        <Save />
      </ActionForm>
      <div className="panel form-grid">
        <h2>Share image</h2>
        <ImageSlot slot="og" imageKey={c.seo.ogImageKey} help="Shown when the site is shared on social media or in chats. 1200 × 630 works best. Without one, the built-in Luggo image is used." />
      </div>
    </>
  );
}
