'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/entities/cart/model/store';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: 'Главная',
    icon: Home,
  },
  {
    href: '/catalog',
    label: 'Каталог',
    icon: Menu,
  },
  {
    href: '/search',
    label: 'Поиск',
    icon: Search,
  },
  {
    href: '/cart',
    label: 'Корзина',
    icon: ShoppingCart,
    showBadge: true,
  },
  {
    href: '/account',
    label: 'Профиль',
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalQuantity());

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-nav md:hidden" aria-label="Мобильная навигация">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative">
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    active && 'scale-110'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.showBadge && totalItems > 0 && (
                  <Badge
                    className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 text-[10px]"
                    aria-label={`${totalItems} товаров в корзине`}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </span>
              <span className={cn('font-medium', active && 'font-semibold')}>
                {item.label}
              </span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
