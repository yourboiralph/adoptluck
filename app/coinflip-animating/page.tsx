"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CoinSide } from "../generated/prisma/enums";

type Props = {
  side: CoinSide; // "HEADS" | "TAILS"
  durationMs?: number; // default 5000
  autoPlay?: boolean;  // default true
  size: number
};

export default function CoinFlipAnimating({
  side,
  durationMs = 5000,
  autoPlay = true,
  size
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // keep a stable random-ish spin count per mount (looks natural)
  const baseSpins = useMemo(() => 10 + Math.floor(Math.random() * 6), []);
  const timeoutRef = useRef<number | null>(null);

  const targetDeg = side === "HEADS" ? 0 : 180;

  const start = () => {
    if (spinning) return;

    setSpinning(true);

    // Spin a lot then land on target (0 or 180)
    // Add current rotation so repeated calls keep continuity.
    const next = rotation + baseSpins * 360 + targetDeg;

    // Trigger transition
    setRotation(next);

    // After animation completes, mark done (so you can re-trigger cleanly)
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setSpinning(false);
    }, durationMs);
  };

  // Auto-run whenever side changes (or on first render)
  useEffect(() => {
    if (!autoPlay) return;
    start();

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]); // run when side updates

return (
  <div
    className="relative perspective-[1000px]"
    style={{ width: size, height: size }}
  >
    <div
      className="absolute inset-0 rounded-full transform-3d transition-transform"
      style={{
        transform: `rotateX(${rotation}deg)`,
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.2)",
      }}
    >
      <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center font-bold [backface-visibility:hidden]">
        HEADS
      </div>

      <div className="absolute inset-0 rounded-full bg-yellow-400 flex items-center justify-center font-bold [backface-visibility:hidden] [transform:rotateX(180deg)]">
        TAILS
      </div>
    </div>
  </div>
);

}
