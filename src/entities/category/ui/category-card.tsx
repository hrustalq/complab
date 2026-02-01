import Link from 'next/link';
import { Monitor, Cpu, Mouse, Wifi, Wrench, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '../model/schemas';

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Cpu,
  Mouse,
  Wifi,
  Wrench,
};

interface CategoryCardProps {
  category: Category & { children?: Category[] };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon ? iconMap[category.icon] : Monitor;

  return (
    <Link href={`/catalog/${category.slug}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
            {Icon && <Icon className="h-8 w-8 text-primary" />}
          </div>
          <h3 className="mb-2 font-semibold group-hover:text-primary">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
          {category.children && category.children.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {category.children.slice(0, 3).map((child) => (
                <span
                  key={child.id}
                  className="text-xs text-muted-foreground"
                >
                  {child.name}
                  {category.children!.indexOf(child) < 2 && ', '}
                </span>
              ))}
              {category.children.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  и еще {category.children.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
