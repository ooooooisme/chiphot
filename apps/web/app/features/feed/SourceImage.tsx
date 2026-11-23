import { useState } from "react";
import type { FeedItemSummary } from "@aihot/contracts/site";

type Variant = "lead" | "secondary" | "compact";

export function SourceImage({ image, variant }: { image: NonNullable<FeedItemSummary["sourceImage"]>; variant: Variant }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const fit = image.fit === "contain" ? "object-contain" : "object-cover";
  return (
    <div className={`src-list-img src-list-img-${variant}`}>
      <img
        src={image.url}
        srcSet={image.srcSet}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setHidden(true)}
        className={`h-full w-full ${fit}`}
      />
    </div>
  );
}