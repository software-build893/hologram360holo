"use client";

import { useState } from "react";
import { slugify } from "@/lib/article";

// Title and address fields together: the address follows the title until it is edited by hand.
export default function SlugField({ title, slug, fieldClass, slugRowClass }: { title: string; slug: string; fieldClass: string; slugRowClass: string }) {
  const [t, setT] = useState(title);
  const [sl, setSl] = useState(slug);
  const [manual, setManual] = useState(Boolean(slug));
  return (
    <>
      <label className={fieldClass}>
        Title
        <input
          name="title"
          required
          maxLength={160}
          value={t}
          autoFocus={!title}
          onChange={(e) => {
            setT(e.target.value);
            if (!manual) setSl(slugify(e.target.value));
          }}
        />
      </label>
      <label className={fieldClass}>
        Address
        <span className={slugRowClass}>
          <span>/articles/</span>
          <input
            name="slug"
            maxLength={80}
            value={sl}
            placeholder="from-the-title"
            onChange={(e) => {
              setManual(true);
              setSl(e.target.value);
            }}
          />
        </span>
      </label>
    </>
  );
}
