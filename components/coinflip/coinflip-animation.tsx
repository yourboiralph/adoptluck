
"use client";

import { useEffect, useMemo, useState } from "react";

type Side = "heads" | "tails";

export default function CoinFlip({
  result,        // server decided
  durationMs = 1600,
  spinning,      // when true, start animation
  onDone,
}: {
  result: Side;
  durationMs?: number;
  spinning: boolean;
  onDone?: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "done">("idle");

  // Pick a deterministic-ish spin count for nicer feel
  const turns = useMemo(() => 6 + Math.floor(Math.random() * 4), []);
  // Final rotation: make sure the coin ends on the correct face
  // Heads = 0deg, Tails = 180deg (around Y axis)
  const finalDeg = result === "heads" ? 0 : 180;
  const spinDeg = turns * 360 + finalDeg;

  useEffect(() => {
    if (!spinning) return;
    setPhase("spinning");

    const t = window.setTimeout(() => {
      setPhase("done");
      onDone?.();
    }, durationMs);

    return () => window.clearTimeout(t);
  }, [spinning, durationMs, onDone]);

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative h-28 w-28 [perspective:900px]"
        aria-label="Coin"
      >
        <div
          className={[
            "absolute inset-0 rounded-full transition-transform will-change-transform",
            "duration-[var(--d)] ease-out [transform-style:preserve-3d]",
            phase === "spinning" ? "" : "",
          ].join(" ")}
          style={
            {
              "--d": `${durationMs}ms`,
              transform:
                phase === "spinning" || phase === "done"
                  ? `rotateY(${spinDeg}deg)`
                  : "rotateY(0deg)",
            } as React.CSSProperties
          }
        >
          {/* Heads */}
          <div className="absolute inset-0 rounded-full bg-white shadow-lg [transform:translateZ(6px)] flex items-center justify-center font-bold text-black">
            H
          </div>

          {/* Tails */}
          <div className="absolute inset-0 rounded-full bg-white shadow-lg [transform:rotateY(180deg)_translateZ(6px)] flex items-center justify-center font-bold text-black">
            T
          </div>

          {/* Coin edge (optional look) */}
          <div className="absolute inset-0 rounded-full border border-black/10 [transform:translateZ(0px)]" />
        </div>
      </div>
    </div>
  );
}
