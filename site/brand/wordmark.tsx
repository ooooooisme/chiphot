// Reader-facing wordmark: 热芯网 (热 in accent) for zh-CN; ChipHOT for English locale.
import { SITE } from "../site.ts";

/** Plain-text brand: accent on 热 (zh) or HOT (en). */
export function BrandWordmark({ className = "" }: { className?: string }) {
  if (SITE.locale.startsWith("zh")) {
    return (
      <span className={`src-brand-wordmark ${className}`} aria-hidden="true">
        <span className="src-brand-hot">热</span>
        <span className="src-brand-tail">芯网</span>
      </span>
    );
  }
  return (
    <span className={className} aria-hidden="true">
      Chip<span className="text-accent">HOT</span>
    </span>
  );
}
