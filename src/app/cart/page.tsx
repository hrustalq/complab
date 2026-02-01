'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/entities/cart/ui/cart-item';
import { useCartStore } from '@/entities/cart/model/store';
import { getProductRepository } from '@/entities/product/model/repository';
import type { Product } from '@/entities/product/model/schemas';
import { db } from '@/shared/database/in-memory-connection';

export default function CartPage() {
  const { items, clearCart } = useCartStore();
  const [cartProducts, setCartProducts] = useState<(Product & { quantity: number })[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const productRepo = getProductRepository(db);
      const loadedProducts: (Product & { quantity: number })[] = [];

      for (const item of items) {
        const product = await productRepo.findById(item.productId);
        if (product) {
          loadedProducts.push({ ...product, quantity: item.quantity });
        }
      }

      if (!cancelled) {
        setCartProducts(loadedProducts);
        setIsLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [items]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 10000 ? 0 : 500;
  const total = subtotal + shipping;

  if (cartProducts.length === 0) {
    return (
      <div className="container py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Главная
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Корзина</span>
        </nav>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Корзина пуста</h1>
          <p className="mb-6 text-muted-foreground">
            Добавьте товары из каталога, чтобы оформить заказ
          </p>
          <Button asChild>
            <Link href="/catalog">
              Перейти в каталог
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Корзина</span>
      </nav>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Корзина</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Очистить корзину
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="divide-y p-0">
              {cartProducts.map((item) => (
                <div key={item.id} className="px-6">
                  <CartItem product={item} quantity={item.quantity} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Code */}
              <div className="flex gap-2">
                <Input
                  placeholder="Промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outline">Применить</Button>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Товары ({cartProducts.length})
                  </span>
                  <span>{formatPrice(subtotal)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Бесплатно</span>
                    ) : (
                      `${formatPrice(shipping)} ₽`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Бесплатная доставка при заказе от 10 000₽
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Итого</span>
                <span>{formatPrice(total)} ₽</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Оформить заказ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
