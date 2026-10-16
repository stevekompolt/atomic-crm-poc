import { useEffect, useState } from "react";

export type PublicBranding = {
  title?: string;
  favicon?: string | null;
  loginBrandImage?: string | null;
  headerLogo?: string | null;
  loginHeroFit?: "cover" | "contain";
};
export function usePublicBranding() {
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const base = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SB_PUBLISHABLE_KEY;
    if (!base || !key) { setReady(true); return; }
    fetch(`${base.replace(/\/$/, "")}/functions/v1/public-branding`, {
      signal: controller.signal,
      headers: { apikey: key },
    }).then(r => { if (!r.ok) throw Error("Branding unavailable"); return r.json(); })
      .then((result: PublicBranding) => { if (!controller.signal.aborted) setBranding(result); })
      .catch(() => {}) // Installation defaults remain safe if endpoint unavailable.
      .finally(() => { if (!controller.signal.aborted) setReady(true); });
    return () => controller.abort();
  }, []);
  return { branding, ready };
}
