"use client";

export function PrintButton() {
  return <button type="button" className="btn btn-primary btn-xs" onClick={() => window.print()}>Print</button>;
}
