"use client";

import { useState } from "react";

/** Accordion: the first item starts open and only one item is open at a time. */
export function Faq({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.id} className="faq-item">
            <button type="button" className="faq-q" aria-expanded={isOpen} aria-controls={`faq-${f.id}`} onClick={() => setOpen(isOpen ? -1 : i)}>
              <span>{f.question}</span>
              <span className="faq-plus" aria-hidden="true">+</span>
            </button>
            {isOpen && <div id={`faq-${f.id}`} className="faq-a">{f.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
