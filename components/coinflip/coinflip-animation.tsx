"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Side = "heads" | "tails";

export default function CoinFlip({
  result,
  durationMs = 1600,
  spinning,
  onDone,
  gameId
}: {
  result: Side;
  durationMs?: number;
  spinning: boolean;
  onDone?: () => void;
  gameId: string
}) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "done">("idle");
  const [turns, setTurns] = useState<number>(6);

  // keep latest onDone without retriggering effects
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Reset when spinning stops or when result changes (new game)
  useEffect(() => {
    if (!spinning) setPhase("idle");
  }, [spinning]);

  useEffect(() => {
    setPhase("idle");
  }, [result]);

  // Start spin
  useEffect(() => {
    if (!spinning) return;

    // reroll turns each spin
    setTurns(6 + Math.floor(Math.random() * 4));

    // force restart even if already "done"
    setPhase("spinning");

    const t = window.setTimeout(() => {
      setPhase("done");
      onDoneRef.current?.();
    }, durationMs);

    return () => window.clearTimeout(t);
  }, [spinning, durationMs, gameId]);

  // Final rotation: heads=0, tails=180
  const finalDeg = result === "heads" ? 0 : 180;

  // Compute spinDeg each render from current turns + result
  const spinDeg = useMemo(() => turns * 360 + finalDeg, [turns, finalDeg]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-28 w-28 perspective-[900px]" aria-label="Coin">
        <div
          className={[
            "absolute inset-0 rounded-full transition-transform will-change-transform",
            "duration-(--d) ease-out transform-3d",
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
          <div className="absolute inset-0 rounded-full bg-white shadow-lg transform-[translateZ(6px)] flex items-center justify-center font-bold text-black">
            H
          </div>

          {/* Tails */}
          <div className="absolute inset-0 rounded-full bg-white shadow-lg transform-[rotateY(180deg)_translateZ(6px)] flex items-center justify-center font-bold text-black">
            T
          </div>

          {/* Coin edge */}
          <div className="absolute inset-0 rounded-full border border-black/10 transform-[translateZ(0px)]" />
        </div>
      </div>
    </div>
  );
}
