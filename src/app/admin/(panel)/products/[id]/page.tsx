import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteProduct } from "@/app/admin/actions/catalog";
import { PackForm } from "@/components/admin/PackForm";
import { ImagesPanel } from "@/components/admin/ImagesPanel";
import { ActionButton } from "@/components/admin/ActionButton";

export default async function EditPackPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const product = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { sort: "asc" } } } });
  if (!product) notFound();
  return (
    <>
      <div className="admin-head">
        <div><div className="crumbs"><Link href="/admin/products">Packs</Link><span>/</span><span className="here">{product.name}</span></div><h1 style={{ marginTop: 8 }}>{product.name}</h1></div>
        <ActionButton action={deleteProduct.bind(null, product.id)} confirmText={`Delete ${product.name}?`} className="btn btn-secondary btn-xs">Delete</ActionButton>
      </div>
      {saved && <div className="flash flash-ok">Pack created.</div>}
      <PackForm product={product} />
      <div style={{ height: 16 }} />
      <ImagesPanel productId={product.id} images={product.images} />
    </>
  );
}
