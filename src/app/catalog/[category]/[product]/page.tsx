import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, Truck, Shield, RotateCcw, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ProductGrid } from '@/entities/product/ui/product-grid';
import { AddToCartButton } from './add-to-cart-button';
import {
  getProductBySlug,
  getAllProducts,
  getRelatedProducts,
} from '@/entities/product/api/handlers';
import { getCategoryBySlug, getCategoryBreadcrumbs } from '@/entities/category/api/handlers';
import { getProductReviews, getProductReviewStats } from '@/entities/review/api/handlers';

interface ProductPageProps {
  params: Promise<{ category: string; product: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({
    category: p.categorySlug,
    product: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { product: productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return { title: 'Товар не найден' };
  }

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category: categorySlug, product: productSlug } = await params;

  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const [category, relatedProducts, reviews, reviewStats] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getRelatedProducts(product.id),
    getProductReviews(product.id),
    getProductReviewStats(product.id),
  ]);

  const breadcrumbs = category ? await getCategoryBreadcrumbs(category.id) : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Группируем спецификации
  const specGroups = product.specifications.reduce(
    (acc, spec) => {
      const group = spec.group || 'Основные';
      if (!acc[group]) acc[group] = [];
      acc[group].push(spec);
      return acc;
    },
    {} as Record<string, typeof product.specifications>
  );

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/catalog" className="hover:text-foreground">
          Каталог
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <Link href={`/catalog/${crumb.slug}`} className="hover:text-foreground">
              {crumb.name}
            </Link>
          </span>
        ))}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="mb-12 grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/30">
            {product.isNew && (
              <Badge className="absolute left-4 top-4 z-10 bg-chart-3 text-chart-3-foreground">Новинка</Badge>
            )}
            {product.isOnSale && discount > 0 && (
              <Badge className="absolute left-4 top-12 z-10" variant="destructive">-{discount}%</Badge>
            )}
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border hover:border-primary"
                >
                  <Image
                    src={img}
                    alt={`${product.name} - фото ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{product.brand}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Арт: {product.sku}</span>
          </div>

          <h1 className="mb-4 text-2xl font-bold lg:text-3xl">{product.name}</h1>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating)
                      ? 'fill-chart-4 text-chart-4'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <Link href="#reviews" className="text-sm text-muted-foreground hover:text-primary">
              {product.reviewsCount} отзывов
            </Link>
          </div>

          <p className="mb-6 text-muted-foreground">{product.shortDescription}</p>

          {/* Price */}
          <div className="mb-6 rounded-xl bg-muted/50 p-6">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.price)} ₽</span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)} ₽
                </span>
              )}
              {discount > 0 && (
                <Badge variant="destructive">
                  Экономия {formatPrice(product.oldPrice! - product.price)} ₽
                </Badge>
              )}
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  product.inStock ? 'bg-chart-3' : 'bg-destructive'
                }`}
              />
              <span className={product.inStock ? 'text-chart-3' : 'text-destructive'}>
                {product.inStock ? `В наличии (${product.stockQuantity} шт.)` : 'Нет в наличии'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <AddToCartButton product={product} />
              <Button variant="outline" size="lg">
                <Heart className="mr-2 h-5 w-5" />В избранное
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary" />
              <span>Доставка: 1-3 дня, бесплатно от 10 000₽</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Гарантия производителя 12 месяцев</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span>Возврат в течение 14 дней</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="description">Описание</TabsTrigger>
          <TabsTrigger value="specs">Характеристики</TabsTrigger>
          <TabsTrigger value="reviews" id="reviews">
            Отзывы ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="prose max-w-none">
          <p>{product.description}</p>
        </TabsContent>

        <TabsContent value="specs">
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(specGroups).map(([group, specs]) => (
              <div key={group} className="rounded-xl border p-6">
                <h3 className="mb-4 font-semibold">{group}</h3>
                <div className="space-y-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{spec.name}</span>
                      <span className="text-right font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          {/* Review Stats */}
          <div className="mb-8 flex flex-wrap items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold">{reviewStats.averageRating}</div>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(reviewStats.averageRating)
                        ? 'fill-chart-4 text-chart-4'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">{reviewStats.totalReviews} отзывов</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-3 text-sm">{rating}</span>
                  <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-chart-4"
                      style={{
                        width: `${
                          reviewStats.totalReviews > 0
                            ? (reviewStats.ratingDistribution[
                                rating as keyof typeof reviewStats.ratingDistribution
                              ] /
                                reviewStats.totalReviews) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm text-muted-foreground">
                    {
                      reviewStats.ratingDistribution[
                        rating as keyof typeof reviewStats.ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{review.userName}</span>
                      {review.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          Проверенная покупка
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-chart-4 text-chart-4'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="mb-2 font-medium">{review.title}</h4>
                <p className="mb-4 text-muted-foreground">{review.content}</p>

                {(review.pros?.length || review.cons?.length) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <span className="mb-2 block text-sm font-medium text-chart-3">
                          Достоинства:
                        </span>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          {review.pros.map((pro, i) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <span className="mb-2 block text-sm font-medium text-destructive">
                          Недостатки:
                        </span>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          {review.cons.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold">Похожие товары</h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </section>
      )}
    </div>
  );
}
