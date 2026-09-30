import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap page-pad" style={{ textAlign: "center", maxWidth: 560 }}>
      <div className="kicker">404</div>
      <h1 className="page-title">This bag didn’t make it to the belt.</h1>
      <p className="lead" style={{ margin: "14px auto 0" }}>The page you’re looking for doesn’t exist, or has moved.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 28 }}>Back to Luggo</Link>
    </main>
  );
}
