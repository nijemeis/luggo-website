import type { ProductImage } from "@prisma/client";
import { imgSrc } from "@/lib/image-urls";
import { deleteImage, updateImage, uploadProductImages } from "@/app/admin/actions/catalog";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { ActionButton } from "./ActionButton";

export function ImagesPanel({ productId, images }: { productId: string; images: ProductImage[] }) {
  return (
    <div className="panel">
      <h2>Photo</h2>
      <p className="help" style={{ marginBottom: 12 }}>Optional. With a photo, the pack card shows it instead of the row of beacon tiles. The first image (lowest order) is used.</p>
      <ActionForm action={uploadProductImages.bind(null, productId)} encType="multipart/form-data" className="form-grid">
        <div className="actions">
          <input type="file" name="images" accept="image/*" multiple className="input input-sm" style={{ width: "auto" }} />
          <SubmitButton className="btn btn-ink btn-xs" pendingText="Uploading & resizing…">Upload</SubmitButton>
        </div>
        <p className="help">JPG, PNG or WebP up to 25 MB. Every upload is resized to 400 / 900 / 1600 px WebP.</p>
      </ActionForm>
      <div className="img-grid" style={{ marginTop: 14 }}>
        {images.map((im) => (
          <div key={im.id} className="img-card">
            <img src={imgSrc(im.key, 400)} alt={im.alt} />
            <ActionForm action={updateImage.bind(null, im.id)} className="ic-body">
              <input className="input input-sm" name="alt" defaultValue={im.alt} placeholder="Alt text" aria-label="Alt text" />
              <div className="actions">
                <input className="input input-sm" name="sort" type="number" defaultValue={im.sort} style={{ width: 64 }} aria-label="Order" />
                <SubmitButton className="btn btn-secondary btn-xs">Save</SubmitButton>
                <ActionButton action={deleteImage.bind(null, im.id)} confirmText="Remove this photo?" className="link-underline">remove</ActionButton>
              </div>
            </ActionForm>
          </div>
        ))}
      </div>
    </div>
  );
}
