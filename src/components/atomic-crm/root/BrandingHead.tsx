import { useEffect } from "react";

type Branding = { title?: string | null; favicon?: string | null };
const DEFAULT_TITLE = "Atomic CRM";

/** Keep both favicon link forms synchronized without restoring the old icon on re-render. */
export function BrandingHead({ title, favicon }: Branding) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    const original = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-crm-branding="true"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      icon.dataset.crmBranding = "true";
      document.head.appendChild(icon);
    }
    const next = favicon || "/favicon.ico";
    // Assign a fresh icon URL only if the selected branding actually changed.
    if (icon.getAttribute("href") !== next) icon.setAttribute("href", next);
    if (original?.getAttribute("href") !== next) original?.setAttribute("href", next);
  }, [title, favicon]);
  return null;
}
