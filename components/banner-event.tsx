import Image from "next/image";

export default function BannerEvent() {
  return (
    <div>
      <div className="relative h-44 border border-border rounded-lg">
        <Image
          src="/banner_2.webp"
          alt="Event Banner"
          fill
          className="object-fill rounded-lg"
          priority
        />
      </div>
    </div>
  );
}
