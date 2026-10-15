import { useEffect } from "react";

type Branding = { title?: string | null; favicon?: string | null };
const DEFAULT_TITLE = "Atomic CRM";

/** Applies installation branding without changing the checked-in HTML assets. */
export function BrandingHead({ title, favicon }: Branding) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    const link = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');
    if (!link) return;
    const original = link.getAttribute("href") || "./favicon.ico";
    link.href = favicon || original;
    return () => {
      link.href = original;
    };
  }, [title, favicon]);
  return null;
}
