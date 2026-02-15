"use client";

import { CoinSide } from "@/app/generated/prisma/enums";
import { useEffect, useRef } from "react";

type Props = {
  side: CoinSide;
  size: number
};

export default function CoinFlipAnimating({ side, size }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [side]);

  return (
    <video
      ref={videoRef}
      src={side === "HEADS" ? "/heads.webm" : "/tails.webm"}
      autoPlay
      muted
      playsInline
      preload="auto"
      onEnded={(e) => e.currentTarget.pause()}
      style={{height: size || "200px"}}
    />
  );
}
