'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { PromoBanner } from '../model/schemas';

interface HeroCarouselProps {
  banners: PromoBanner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div
              className="relative h-[300px] overflow-hidden rounded-xl sm:h-[400px] lg:h-[500px]"
              style={{ backgroundColor: banner.backgroundColor || '#1a1a2e' }}
            >
              {/* Background Image */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover opacity-60"
                priority
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-12 lg:px-16">
                <div className="max-w-xl">
                  {banner.discountPercent && (
                    <span className="mb-4 inline-block rounded-full bg-red-500 px-4 py-1 text-sm font-semibold text-white">
                      Скидки до {banner.discountPercent}%
                    </span>
                  )}
                  <h2
                    className="mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl"
                    style={{ color: banner.textColor || '#ffffff' }}
                  >
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p
                      className="mb-2 text-lg sm:text-xl lg:text-2xl"
                      style={{ color: banner.textColor || '#ffffff' }}
                    >
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.description && (
                    <p
                      className="mb-6 text-sm opacity-90 sm:text-base"
                      style={{ color: banner.textColor || '#ffffff' }}
                    >
                      {banner.description}
                    </p>
                  )}
                  {banner.buttonText && (
                    <Button asChild size="lg" className="font-semibold">
                      <Link href={banner.link}>{banner.buttonText}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 hidden sm:flex" />
      <CarouselNext className="right-4 hidden sm:flex" />
    </Carousel>
  );
}
