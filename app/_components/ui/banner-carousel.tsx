"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image, { StaticImageData } from "next/image";
import { useCallback, useEffect, useState } from "react";

interface BannerCarouselProps {
  banners: StaticImageData[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative mt-6 w-full">
      {/* Viewport do carrossel */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((src, index) => (
            <div key={index} className="flex-none w-full">
              <Image
                src={src}
                alt={`Banner ${index + 1}`}
                sizes="100vw"
                className="h-auto w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots de paginação */}
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex
                ? "w-4 bg-primary"
                : "w-2 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
