import { STATE_LABEL, type Station, type StationState } from "@/lib/custody";
import { StateDot } from "./marks";

const X = (i: number) => 250 * i + 20; // station x in viewBox units (matches left: 25%*i + 2%)

function segment(i: number) {
  const a = X(i);
  const b = X(i + 1);
  return `M${a} 32 C${a + 85} 62 ${b - 85} 2 ${b} 32`;
}

function SegmentPath({ i, state, order }: { i: number; state: StationState; order: number }) {
  const d = segment(i);
  // The gray thread is always present at rest, so the figure is never empty.
  const thread = (
    <path d={d} fill="none" stroke="var(--thread)" strokeWidth={1.4} strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
  );
  if (state === "carried") {
    return (
      <>
        {thread}
        <path
          d={d}
          pathLength={1}
          className="ribbon-draw"
          style={{ animationDelay: `${120 + order * 260}ms` }}
          fill="none"
          stroke="var(--ribbon)"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </>
    );
  }
  if (state === "stopped") {
    return <path d={d} fill="none" stroke="var(--ink-soft)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" />;
  }
  return thread;
}

export function CustodyLine({
  stations,
  caption,
  meta,
  hrefs,
}: {
  stations: Station[];
  caption: React.ReactNode;
  meta?: React.ReactNode;
  /** Optional per-station anchors into the run record; only stations the record proves get one. */
  hrefs?: Partial<Record<Station["key"], string>>;
}) {
  let carriedSeen = 0;
  return (
    <figure className="custody" aria-label="Custody line: how far the attacker's instruction travelled">
      <div className="custody-tab" aria-hidden="true">
        The instruction
      </div>
      <figcaption>
        <span>{caption}</span>
        {meta ? <span className="caps">{meta}</span> : null}
      </figcaption>
      <div className="custody-track">
        <svg className="custody-svg" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
          {stations.slice(1).map((s, i) => (
            <SegmentPath key={s.key} i={i} state={s.state} order={s.state === "carried" ? carriedSeen++ : 0} />
          ))}
        </svg>
        {stations.map((s, i) => (
          <span
            key={s.key}
            aria-hidden="true"
            className="custody-dot-abs"
            style={{ position: "absolute", top: 24, left: `calc(${25 * i + 2}% - 8px)` }}
          >
            <StateDot state={s.state} />
          </span>
        ))}
      </div>
      <ol className="custody-stations">
        {stations.map((s) => {
          const body = (
            <>
              <StateDot state={s.state} />
              <span className="st-title">{s.title}</span>
              <span className="st-state caps">{s.label}</span>
              <span className="st-note">{s.note}</span>
            </>
          );
          const href = hrefs?.[s.key];
          return (
            <li key={s.key} className={`st-${s.state}`}>
              {href ? (
                <a className="st-link" href={href} aria-label={`${s.title}: ${s.label}. Go to the evidence in this record.`}>
                  {body}
                </a>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
      <div className="custody-legend caps" aria-label="Legend">
        {(["carried", "stopped", "unobserved", "na"] as StationState[]).map((st) => (
          <span key={st}>
            <StateDot state={st} size={13} /> {STATE_LABEL[st]}
          </span>
        ))}
      </div>
    </figure>
  );
}
