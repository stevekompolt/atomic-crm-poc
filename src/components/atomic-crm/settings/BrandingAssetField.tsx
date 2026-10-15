import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type Props = { source: string; label: string; help: string; className?: string };
const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

/** Does not crop or re-encode: preserves wide logos and animated GIF frames. */
export function BrandingAssetField({ source, label, help, className }: Props) {
  const { control, setValue } = useFormContext();
  const [error, setError] = useState("");
  const value = useWatch({ control, name: source });
  const src: string | undefined = typeof value === "string" ? value : value?.src;

  const onFile = (file?: File) => {
    if (!file) return;
    if (!allowed.has(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Use PNG, JPEG, WebP or GIF, up to 2 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue(source, reader.result, { shouldDirty: true });
      }
    };
    reader.onerror = () => setError("Unable to read image.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{help}</p>
      {src && <img src={src} alt={label} className={className ?? "max-h-28 max-w-full object-contain"} />}
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
        aria-label={label} onChange={(e) => onFile(e.target.files?.[0])}
        className="block w-full text-xs" />
      {src && <button type="button" className="text-xs underline"
        onClick={() => setValue(source, null, { shouldDirty: true })}>Remove</button>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
