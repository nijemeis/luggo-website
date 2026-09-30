import Link from "next/link";
import { PackForm } from "@/components/admin/PackForm";

export default function NewPackPage() {
  return (
    <>
      <div className="admin-head"><div><div className="crumbs"><Link href="/admin/products">Packs</Link><span>/</span><span className="here">New</span></div><h1 style={{ marginTop: 8 }}>New pack</h1></div></div>
      <PackForm product={null} />
    </>
  );
}
