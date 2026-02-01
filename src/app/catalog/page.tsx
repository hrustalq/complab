import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/entities/category/ui/category-card';
import { ProductGrid } from '@/entities/product/ui/product-grid';
import { getCategories } from '@/entities/category/api/handlers';
import { getAllProducts, searchProducts } from '@/entities/product/api/handlers';

export const metadata = {
  title: 'Каталог товаров',
  description: 'Каталог компьютерной техники и комплектующих. Ноутбуки, видеокарты, процессоры и многое другое.',
};

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  // Фильтрация товаров
  let filteredProducts = [...allProducts];

  if (params.search) {
    const searchQuery = String(params.search);
    filteredProducts = await searchProducts({ query: searchQuery, limit: 100 });
  }

  if (params.featured === 'true') {
    filteredProducts = filteredProducts.filter((p) => p.isFeatured);
  }

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Каталог</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">Каталог товаров</h1>

      {/* Search Results */}
      {params.search && (
        <div className="mb-8">
          <p className="mb-4 text-muted-foreground">
            Результаты поиска по запросу: <strong>&quot;{params.search}&quot;</strong>
          </p>
          <ProductGrid products={filteredProducts} columns={4} />
        </div>
      )}

      {/* Categories */}
      {!params.search && (
        <>
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold">Категории</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* All Products */}
          <section>
            <h2 className="mb-6 text-xl font-semibold">Все товары</h2>
            <ProductGrid products={filteredProducts} columns={4} />
          </section>
        </>
      )}
    </div>
  );
}
