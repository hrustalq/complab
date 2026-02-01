import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductGrid } from '@/entities/product/ui/product-grid';
import {
  getCategoryBySlug,
  getCategoryBreadcrumbs,
  getAllCategories,
} from '@/entities/category/api/handlers';
import { getProductsByCategorySlug } from '@/entities/product/api/handlers';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const allCategories = await getAllCategories();
  return allCategories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return { title: 'Категория не найдена' };
  }

  return {
    title: category.name,
    description: category.description || `Купить ${category.name.toLowerCase()} в CompLab`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  const [category, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const breadcrumbs = await getCategoryBreadcrumbs(category.id);

  // Получаем товары категории и подкатегорий
  let categoryProducts = await getProductsByCategorySlug(categorySlug);

  // Если это родительская категория, собираем товары из подкатегорий
  if (categoryProducts.length === 0) {
    const childCategories = categories.filter((c) => c.parentId === category.id);
    for (const child of childCategories) {
      const childProducts = await getProductsByCategorySlug(child.slug);
      categoryProducts = [...categoryProducts, ...childProducts];
    }
  }

  // Получаем подкатегории
  const subcategories = categories.filter((c) => c.parentId === category.id);

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
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground">{crumb.name}</span>
            ) : (
              <Link href={`/catalog/${crumb.slug}`} className="hover:text-foreground">
                {crumb.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Подкатегории</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Button key={sub.id} variant="outline" size="sm" asChild>
                <Link href={`/catalog/${sub.slug}`}>{sub.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Найдено: {categoryProducts.length} товаров
        </p>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Select defaultValue="popular">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">По популярности</SelectItem>
              <SelectItem value="price-asc">Сначала дешевле</SelectItem>
              <SelectItem value="price-desc">Сначала дороже</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="new">Сначала новые</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products */}
      <ProductGrid products={categoryProducts} columns={4} />
    </div>
  );
}
