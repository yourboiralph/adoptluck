
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
};

export default function PetImage({
  src,
  alt,
  size = 70,
  className,
  fallbackSrc = "/no-image.png",
}: Props) {
  const initial = useMemo(() => {
    const s = typeof src === "string" ? src.trim() : "";
    return s.length ? s : fallbackSrc;
  }, [src, fallbackSrc]);

  const [imgSrc, setImgSrc] = useState(initial);

  return (
    <Image
      width={size}
      height={size}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      // optional but often needed if Next optimizer is causing issues with 404s
      unoptimized
    />
  );
}
