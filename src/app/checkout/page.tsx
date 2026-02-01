'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, CreditCard, Wallet, Banknote, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/entities/cart/model/store';
import { useUserStore } from '@/entities/user/model/store';
import { getProductRepository } from '@/entities/product/model/repository';
import { mockAddresses, mockUser } from '@/entities/user/model/repository';
import type { Product } from '@/entities/product/model/schemas';
import { db } from '@/shared/database/in-memory-connection';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, login } = useUserStore();
  const [cartProducts, setCartProducts] = useState<(Product & { quantity: number })[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Форма для гостя
  const [guestForm, setGuestForm] = useState({
    email: '',
    phone: '',
    fullName: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: '',
  });

  useEffect(() => {
    // Авто-логин для демо
    if (!isAuthenticated) {
      login(mockUser);
    }
    // Используем requestAnimationFrame для избежания каскадных рендеров
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isAuthenticated, login]);

  useEffect(() => {
    if (mounted) {
      const loadProducts = async () => {
        const productRepo = getProductRepository(db);
        const loadedProducts: (Product & { quantity: number })[] = [];
        
        for (const item of items) {
          const product = await productRepo.findById(item.productId);
          if (product) {
            loadedProducts.push({ ...product, quantity: item.quantity });
          }
        }
        setCartProducts(loadedProducts);
      };
      loadProducts();
    }
  }, [items, mounted]);

  if (!mounted) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Симуляция отправки заказа
    await new Promise((resolve) => setTimeout(resolve, 1500));

    clearCart();
    router.push('/checkout/success');
  };

  if (cartProducts.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/cart" className="hover:text-foreground">
          Корзина
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Оформление заказа</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">Оформление заказа</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Forms */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Контактные данные</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isAuthenticated ? mockUser.email : guestForm.email}
                    onChange={(e) =>
                      setGuestForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={isAuthenticated ? mockUser.phone : guestForm.phone}
                    onChange={(e) =>
                      setGuestForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Адрес доставки</CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthenticated && mockAddresses.length > 0 ? (
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {mockAddresses.map((address) => (
                      <Label
                        key={address.id}
                        htmlFor={address.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium">{address.title}</span>
                            {address.isDefault && (
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                По умолчанию
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.street}, д. {address.building}
                            {address.apartment && `, кв. ${address.apartment}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.postalCode}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">ФИО получателя *</Label>
                      <Input
                        id="fullName"
                        value={guestForm.fullName}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Город *</Label>
                      <Input
                        id="city"
                        value={guestForm.city}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Индекс *</Label>
                      <Input
                        id="postalCode"
                        value={guestForm.postalCode}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, postalCode: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="street">Улица *</Label>
                      <Input
                        id="street"
                        value={guestForm.street}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, street: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="building">Дом *</Label>
                      <Input
                        id="building"
                        value={guestForm.building}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, building: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Квартира</Label>
                      <Input
                        id="apartment"
                        value={guestForm.apartment}
                        onChange={(e) =>
                          setGuestForm((prev) => ({ ...prev, apartment: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Способ оплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="card"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">Банковская карта</span>
                      <p className="text-sm text-muted-foreground">
                        Visa, MasterCard, МИР
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="online"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                  >
                    <RadioGroupItem value="online" id="online" />
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">Онлайн-оплата</span>
                      <p className="text-sm text-muted-foreground">
                        СБП, ЮMoney, QIWI
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="cash"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                  >
                    <RadioGroupItem value="cash" id="cash" />
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">При получении</span>
                      <p className="text-sm text-muted-foreground">
                        Наличные или карта курьеру
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Укажите дополнительную информацию для курьера..."
                  className="resize-none"
                />
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
                {/* Products */}
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {cartProducts.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                        <Image
                          src={item.images[0] || '/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-0 right-0 rounded-tl bg-primary px-1.5 text-xs text-primary-foreground">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price * item.quantity)} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товары</span>
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
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого</span>
                  <span>{formatPrice(total)} ₽</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Оформление...'
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Подтвердить заказ
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <Link href="/legal/oferta" className="underline hover:text-foreground">
                    условиями оферты
                  </Link>{' '}
                  и{' '}
                  <Link href="/legal/privacy" className="underline hover:text-foreground">
                    политикой конфиденциальности
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
