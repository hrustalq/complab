'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '../model/store';
import type { Product } from '@/entities/product/model/schemas';

interface CartItemProps {
  product: Product;
  quantity: number;
}

export function CartItem({ product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <Link
        href={`/catalog/${product.categorySlug}/${product.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted/30"
      >
        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/catalog/${product.categorySlug}/${product.slug}`}
          className="line-clamp-2 font-medium hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="text-sm text-muted-foreground">{product.brand}</p>

        <div className="mt-auto flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stockQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price & Delete */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{formatPrice(product.price * quantity)} ₽</p>
              {quantity > 1 && (
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price)} ₽ × {quantity}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
