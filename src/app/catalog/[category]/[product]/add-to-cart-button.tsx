'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/entities/cart/model/store';
import type { Product } from '@/entities/product/model/schemas';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const quantity = useCartStore((state) => state.getItemQuantity(product.id));
  const isInCart = quantity > 0;

  const handleClick = () => {
    addItem(product.id);
  };

  if (!product.inStock) {
    return (
      <Button size="lg" disabled className="flex-1">
        Нет в наличии
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="flex-1"
      variant={isInCart ? 'secondary' : 'default'}
    >
      {isInCart ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          В корзине ({quantity})
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          В корзину
        </>
      )}
    </Button>
  );
}
