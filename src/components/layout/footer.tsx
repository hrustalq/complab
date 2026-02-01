import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 pb-20 md:pb-0">
      <div className="container py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold">CompLab</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Магазин компьютерной техники и сервисный центр. Продажа, ремонт и
              обслуживание ПК, ноутбуков и комплектующих.
            </p>
            
            {/* Contact info - More prominent on mobile */}
            <div className="mt-4 space-y-3 text-sm">
              <a
                href="tel:+78001234567"
                className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                8 (800) 123-45-67
              </a>
              <a
                href="mailto:info@complab.ru"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                info@complab.ru
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Москва, ул. Примерная, 123</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                Пн-Вс: 10:00 - 21:00
              </div>
            </div>
          </div>

          {/* Catalog - Collapsible on small mobile */}
          <div>
            <h3 className="mb-3 font-semibold sm:mb-4">Каталог</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1 sm:gap-x-0">
              <li>
                <Link
                  href="/catalog/computers"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Компьютеры и ноутбуки
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog/components"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Комплектующие
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog/peripherals"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Периферия
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog/networking"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сетевое оборудование
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="font-medium text-destructive hover:text-destructive/80 transition-colors"
                >
                  Распродажа
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-3 font-semibold sm:mb-4">Услуги</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1 sm:gap-x-0">
              <li>
                <Link
                  href="/repair"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ремонт техники
                </Link>
              </li>
              <li>
                <Link
                  href="/services/pc-build"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сборка ПК
                </Link>
              </li>
              <li>
                <Link
                  href="/services/upgrade"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Апгрейд компьютера
                </Link>
              </li>
              <li>
                <Link
                  href="/services/data-recovery"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Восстановление данных
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Доставка
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-3 font-semibold sm:mb-4">Подписка на новости</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Узнавайте первыми о скидках и новинках
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Ваш email"
                className="flex-1"
                aria-label="Email для подписки"
              />
              <Button type="submit" size="icon" aria-label="Подписаться">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium">Мы в соцсетях</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </a>
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row sm:text-sm">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Пользовательское соглашение
            </Link>
            <Link href="/legal/oferta" className="hover:text-foreground transition-colors">
              Публичная оферта
            </Link>
          </div>
          <p className="text-center">© 2024 CompLab. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
