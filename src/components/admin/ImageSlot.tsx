import { imgSrc } from "@/lib/image-urls";
import { clearContentImage, uploadContentImage } from "@/app/admin/actions/settings";
import { ActionForm } from "./ActionForm";
import { ActionButton } from "./ActionButton";
import { SubmitButton } from "./SubmitButton";

/** Upload/replace/remove one content image (beacon photo, social share image). */
export function ImageSlot({ slot, imageKey, help }: { slot: "beacon" | "og"; imageKey: string; help: string }) {
  return (
    <ActionForm action={uploadContentImage.bind(null, slot)} encType="multipart/form-data" className="form-grid">
      <div className="actions" style={{ alignItems: "flex-start" }}>
        {imageKey ? <img src={imgSrc(imageKey, 400)} alt="" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 14 }} /> : <div className="thumb" style={{ width: 120, height: 120, borderRadius: 14 }} />}
        <div className="form-grid" style={{ flex: 1, minWidth: 220 }}>
          <input type="file" name="image" accept="image/*" className="input input-sm" />
          <div className="actions">
            <SubmitButton className="btn btn-ink btn-xs" pendingText="Uploading…">{imageKey ? "Replace" : "Upload"}</SubmitButton>
            {imageKey && <ActionButton action={clearContentImage.bind(null, slot)} confirmText="Remove this image?" className="link-underline">remove</ActionButton>}
          </div>
          <p className="help">{help}</p>
        </div>
      </div>
    </ActionForm>
  );
}
