import Image from "next/image";

export default function BannerEvent() {
  return (
    <div>
      <div className="relative w-full aspect-16/5 rounded-lg overflow-hidden">
        <Image
          src="/adoptluckbanner.png"
          alt="Event Banner"
          fill
          className="object-cover object-center"
          priority
        />
      </div>


    </div>
  );
}
