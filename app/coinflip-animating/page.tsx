"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CoinSide } from "../generated/prisma/enums";

type Props = {
  side: CoinSide; // "HEADS" | "TAILS"
  durationMs?: number; // default 5000
  autoPlay?: boolean;  // default true
  size: number
  gameId: string
};

export default function CoinFlipAnimating({
  side,
  durationMs = 5000,
  autoPlay = true,
  size,
  gameId
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

  setRotation((prev) => prev + baseSpins * 360 + targetDeg);

  if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  timeoutRef.current = window.setTimeout(() => setSpinning(false), durationMs);
};


  // Auto-run whenever side changes (or on first render)
  useEffect(() => {
    if (!autoPlay) return;
    start();

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, side]); // run when side updates

return (
  <div
    className="relative"
    style={{
      width: size,
      height: size,
      perspective: "1000px",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "9999px",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rotation}deg)`,
        transitionProperty: "transform",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.2)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          backfaceVisibility: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
        className="bg-yellow-300"
      >
        HEADS
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          backfaceVisibility: "hidden",
          transform: "rotateX(180deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
        className="bg-yellow-400"
      >
        TAILS
      </div>
    </div>
  </div>
);


}
