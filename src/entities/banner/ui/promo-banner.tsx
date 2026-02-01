import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PromoBanner } from '../model/schemas';

interface PromoBannerCardProps {
  banner: PromoBanner;
}

export function PromoBannerCard({ banner }: PromoBannerCardProps) {
  return (
    <Link href={banner.link}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="relative p-0">
          <div className="relative h-36 w-full overflow-hidden">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="mb-1 font-semibold">{banner.title}</h3>
            {banner.subtitle && (
              <p className="text-sm opacity-90">{banner.subtitle}</p>
            )}
            <span className="mt-2 inline-flex items-center text-sm font-medium opacity-90 group-hover:opacity-100">
              {banner.buttonText || 'Подробнее'}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface PromoBannersGridProps {
  banners: PromoBanner[];
}

export function PromoBannersGrid({ banners }: PromoBannersGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map((banner) => (
        <PromoBannerCard key={banner.id} banner={banner} />
      ))}
    </div>
  );
}
