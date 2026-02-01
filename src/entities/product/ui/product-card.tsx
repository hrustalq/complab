'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/entities/cart/model/store';
import type { Product } from '../model/schemas';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const itemQuantity = useCartStore((state) => state.getItemQuantity(product.id));

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {product.isNew && (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">Новинка</Badge>
        )}
        {product.isOnSale && discount > 0 && (
          <Badge className="bg-red-500 hover:bg-red-600">-{discount}%</Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
      >
        <Heart className="h-4 w-4" />
      </Button>

      <Link href={`/catalog/${product.categorySlug}/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 text-xs text-muted-foreground">{product.brand}</div>
        
        <Link href={`/catalog/${product.categorySlug}/${product.slug}`}>
          <h3 className="mb-2 line-clamp-2 min-h-10 text-sm font-medium leading-tight hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewsCount})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(product.price)} ₽</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)} ₽
            </span>
          )}
        </div>

        {/* Stock & Cart */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs ${
              product.inStock ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {product.inStock ? 'В наличии' : 'Нет в наличии'}
          </span>

          {product.inStock && (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                addItem(product.id);
              }}
              className="h-8"
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              {itemQuantity > 0 ? `В корзине (${itemQuantity})` : 'В корзину'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
