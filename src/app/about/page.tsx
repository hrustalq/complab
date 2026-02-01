import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Users, Award, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'О компании',
  description: 'CompLab — магазин компьютерной техники и сервисный центр. Работаем с 2010 года.',
};

export default function AboutPage() {
  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="bg-linear-to-br from-primary/10 via-background to-background py-16">
        <div className="container">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">О компании</span>
          </nav>

          <h1 className="mb-4 text-4xl font-bold">О компании CompLab</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Мы — команда энтузиастов, которые живут компьютерами и технологиями.
            С 2010 года помогаем клиентам выбирать лучшую технику и поддерживаем её в рабочем состоянии.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">14+</div>
                <p className="text-muted-foreground">лет на рынке</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">50 000+</div>
                <p className="text-muted-foreground">довольных клиентов</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">10 000+</div>
                <p className="text-muted-foreground">товаров в каталоге</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">98%</div>
                <p className="text-muted-foreground">положительных отзывов</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container py-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold">Наша история</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                CompLab начинался как небольшой магазин компьютерных комплектующих
                в 2010 году. Основатели — двое друзей-программистов, которые хотели
                создать место, где каждый сможет получить качественную консультацию
                и найти именно то, что нужно.
              </p>
              <p>
                Сегодня мы — полноценный IT-ритейлер с собственным сервисным центром.
                Наша команда выросла до 50 специалистов, но мы сохранили главное —
                индивидуальный подход к каждому клиенту.
              </p>
              <p>
                Мы не просто продаём технику — мы помогаем разобраться в ней,
                подобрать оптимальное решение под ваши задачи и бюджет.
              </p>
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
              alt="Наш офис"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">Наши ценности</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Клиент в центре</h3>
                <p className="text-muted-foreground">
                  Мы слушаем и понимаем потребности каждого клиента,
                  чтобы предложить лучшее решение
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Качество</h3>
                <p className="text-muted-foreground">
                  Работаем только с проверенными поставщиками и предоставляем
                  официальную гарантию
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Оперативность</h3>
                <p className="text-muted-foreground">
                  Быстрая обработка заказов, оперативная доставка и ремонт
                  в кратчайшие сроки
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container py-12">
        <div className="rounded-xl bg-primary/5 p-8 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">Приходите к нам</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Адрес</p>
                    <p className="text-muted-foreground">
                      г. Москва, ул. Примерная, д. 123
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Режим работы</p>
                    <p className="text-muted-foreground">
                      Пн-Сб: 10:00 - 21:00<br />
                      Вс: 11:00 - 19:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
                alt="Наш магазин"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
