import type { StationState } from "@/lib/custody";

/** Ribbon bookmark: the section-opener mark. */
export function Bookmark({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={(size * 2) / 3} height={size} viewBox="0 0 12 18" aria-hidden="true">
      <path d="M0 0H12V18L6 13.5L0 18Z" fill={color} />
    </svg>
  );
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Folded tape flag: marks where an action sequence stopped. */
export function Flag({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 1.5v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3.7 2h9.3l-2.4 3.2L13 8.4H3.7z" fill="currentColor" />
    </svg>
  );
}

/**
 * State is carried by the mark's SHAPE (filled ring, cut ring, dashed ring,
 * dotted point) as well as its colour, and always sits next to a text label.
 */
export function StateDot({ state, size = 16 }: { state: StationState; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true as const, className: "st-dot" };
  switch (state) {
    case "carried":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.2" fill="var(--buff)" stroke="var(--ribbon)" strokeWidth="1.8" />
          <circle cx="8" cy="8" r="3" fill="var(--ribbon)" />
        </svg>
      );
    case "stopped":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.2" fill="var(--buff)" stroke="var(--ink-soft)" strokeWidth="1.4" />
          <path d="M4.2 11.8 11.8 4.2" stroke="var(--ink-soft)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "unobserved":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.2" fill="var(--buff)" stroke="var(--thread)" strokeWidth="1.4" strokeDasharray="2.4 2.2" />
        </svg>
      );
    case "na":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.6" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        </svg>
      );
  }
}

export function Stamp({ title = "Sample", sub = "No model" }: { title?: string; sub?: string }) {
  return (
    <div className="stamp" role="img" aria-label={`${title}: ${sub}`}>
      <div>
        <span>Illustrative</span>
        <b>{title}</b>
        <span>{sub}</span>
      </div>
    </div>
  );
}
