'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  MapPin,
  ChevronDown,
  Heart,
  LogIn,
  X,
  ChevronRight,
  Wrench,
  Home,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/entities/cart/model/store';
import { useUserStore } from '@/entities/user/model/store';
import { getCategoryRepository } from '@/entities/category/model/repository';
import type { CategoryWithChildren } from '@/entities/category/model/schemas';
import { db } from '@/shared/database/in-memory-connection';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = useCartStore((state) => state.getTotalQuantity());
  const { isAuthenticated, user } = useUserStore();
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  useEffect(() => {
    const categoryRepo = getCategoryRepository(db);
    categoryRepo.findTree().then(setCategories);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/catalog', label: 'Каталог', icon: Menu, hasSubmenu: true },
    { href: '/repair', label: 'Ремонт техники', icon: Wrench },
    { href: '/sale', label: 'Распродажа', icon: Tag, highlight: 'text-red-500' },
    { href: '/new', label: 'Новинки', icon: Sparkles, highlight: 'text-emerald-600' },
    { href: '/about', label: 'О компании', icon: null },
    { href: '/contacts', label: 'Контакты', icon: null },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all safe-top',
        isScrolled
          ? 'bg-background/95 shadow-md backdrop-blur supports-backdrop-filter:bg-background/80'
          : 'bg-background'
      )}
    >
      {/* Top Bar - Hidden on mobile */}
      <div className="hidden border-b bg-muted/30 sm:block">
        <div className="container flex h-10 items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              О компании
            </Link>
            <Link
              href="/delivery"
              className="hover:text-foreground transition-colors"
            >
              Доставка
            </Link>
            <Link
              href="/warranty"
              className="hidden hover:text-foreground transition-colors md:inline-flex"
            >
              Гарантия
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="tel:+78001234567"
              className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>8 (800) 123-45-67</span>
            </a>
            <span className="hidden items-center gap-1.5 text-muted-foreground lg:flex">
              <MapPin className="h-3.5 w-3.5" />
              Москва
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex h-14 items-center gap-2 sm:h-16 sm:gap-4 lg:gap-8">
        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 shrink-0 lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 safe-left">
            <SheetHeader className="border-b p-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-left">Меню</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
            
            {/* Mobile Search */}
            <div className="border-b p-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск товаров..."
                    className="w-full pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <nav className="flex flex-col touch-scroll overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 140px)' }}>
              {menuItems.map((item) => (
                <div key={item.href}>
                  {item.hasSubmenu ? (
                    <div className="border-b">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between px-4 py-3 font-medium hover:bg-muted transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon && <item.icon className="h-5 w-5 text-muted-foreground" />}
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <div className="bg-muted/30">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/catalog/${cat.slug}`}
                            className="flex items-center gap-3 px-4 py-2.5 pl-12 text-sm hover:bg-muted transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 border-b px-4 py-3 hover:bg-muted transition-colors',
                        item.highlight,
                        pathname === item.href && 'bg-primary/5 text-primary'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className={cn('h-5 w-5', item.highlight || 'text-muted-foreground')} />}
                      <span className={item.highlight ? 'font-medium' : ''}>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Contact info in mobile menu */}
              <div className="mt-auto border-t p-4">
                <a
                  href="tel:+78001234567"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  8 (800) 123-45-67
                </a>
                <p className="mt-2 text-xs text-muted-foreground">Ежедневно с 10:00 до 21:00</p>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-9 sm:w-9">
            <span className="text-base font-bold text-primary-foreground sm:text-lg">C</span>
          </div>
          <span className="hidden text-xl font-bold sm:inline">CompLab</span>
        </Link>

        {/* Catalog Button - Desktop only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="hidden lg:flex">
              <Menu className="mr-2 h-4 w-4" />
              Каталог
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="flex items-center gap-2"
                >
                  {category.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/catalog" className="font-medium">
                Все категории
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search - Desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск товаров..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        {/* Spacer for mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label={isSearchOpen ? 'Закрыть поиск' : 'Открыть поиск'}
        >
          {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden h-10 w-10 sm:flex" 
            asChild
          >
            <Link href="/favorites" aria-label="Избранное">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hidden h-10 w-10 sm:flex" 
            asChild
          >
            <Link href="/cart" aria-label={`Корзина${totalItems > 0 ? `, ${totalItems} товаров` : ''}`}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {totalItems > 9 ? '9+' : totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden h-10 w-10 sm:flex"
                  aria-label="Аккаунт"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user?.firstName}</p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Личный кабинет</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">Мои заказы</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/repairs">Мои ремонты</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => useUserStore.getState().logout()}
                  className="text-destructive"
                >
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden h-10 px-3 sm:flex" 
              asChild
            >
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Search Dropdown */}
      {isSearchOpen && (
        <div className="border-t bg-background p-4 sm:hidden animate-slide-down">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Navigation - Desktop only */}
      <nav className="hidden border-t lg:block" aria-label="Главная навигация">
        <div className="container flex h-12 items-center gap-8">
          <Link
            href="/catalog"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname.startsWith('/catalog') && 'text-primary'
            )}
          >
            Каталог
          </Link>
          <Link
            href="/repair"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname.startsWith('/repair') && 'text-primary'
            )}
          >
            Ремонт техники
          </Link>
          <Link
            href="/sale"
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
          >
            Распродажа
          </Link>
          <Link
            href="/new"
            className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Новинки
          </Link>
          <div className="flex-1" />
          <Link
            href="/contacts"
            className={cn(
              'text-sm transition-colors hover:text-primary',
              pathname === '/contacts' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Контакты
          </Link>
        </div>
      </nav>
    </header>
  );
}
