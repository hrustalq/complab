# 🎨 Styling Guide

## Технологии

- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Переиспользуемые компоненты
- **CSS Variables** - Темизация

## Структура стилей

```
src/
├── app/
│   └── globals.css       # Глобальные стили, CSS переменные
├── components/
│   └── ui/               # shadcn/ui компоненты
└── lib/
    └── utils.ts          # cn() helper
```

## CSS Variables (globals.css)

```css
@layer base {
  :root {
    --background: oklch(100% 0 0);
    --foreground: oklch(14.08% 0.004 286);
    --primary: oklch(55.75% 0.182 254);
    --primary-foreground: oklch(97.06% 0.014 254);
    /* ... */
  }

  .dark {
    --background: oklch(14.08% 0.004 286);
    --foreground: oklch(98.48% 0 0);
    /* ... */
  }
}
```

## Tailwind CSS Best Practices

### Использование cn() для условных классов

```typescript
import { cn } from '@/lib/utils';

function Component({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isActive && 'border-primary bg-primary/5'
      )}
    >
      {/* ... */}
    </div>
  );
}
```

### Предпочтительные классы

| Старый вариант | Новый вариант |
|----------------|---------------|
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `min-h-[2.5rem]` | `min-h-10` |
| `supports-[backdrop-filter]:bg-background/80` | `supports-backdrop-filter:bg-background/80` |

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4
  gap-4
">
```

### Breakpoints

| Prefix | Min Width |
|--------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

## Компоненты shadcn/ui

### Установка компонентов

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Правильное использование Card

**Важно:** Каждая часть Card имеет своё назначение. Не помещайте весь контент в CardContent!

```typescript
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ✅ ПРАВИЛЬНО - каждая часть на своём месте
function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      {/* CardHeader: заголовок, подзаголовок, теги/badges */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
        <CardDescription>{product.shortDescription}</CardDescription>
      </CardHeader>

      {/* CardContent: основной контент (изображения, характеристики, описание) */}
      <CardContent>
        <img src={product.image} alt={product.name} className="w-full rounded-lg" />
        <p className="mt-4 text-2xl font-bold">{product.price} ₽</p>
      </CardContent>

      {/* CardFooter: действия (кнопки, ссылки) */}
      <CardFooter className="flex gap-2">
        <Button className="flex-1">В корзину</Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ❌ НЕПРАВИЛЬНО - всё свалено в CardContent
function BadProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3>{product.name}</h3>
        <Badge>{product.category}</Badge>
        <p>{product.description}</p>
        <img src={product.image} />
        <p>{product.price} ₽</p>
        <Button>В корзину</Button>  {/* Кнопки должны быть в CardFooter! */}
      </CardContent>
    </Card>
  );
}
```

### Структура Card компонентов

| Компонент | Назначение | Контент |
|-----------|------------|---------|
| `CardHeader` | Шапка карточки | Заголовок, подзаголовок, badges, теги |
| `CardTitle` | Заголовок | Название (h3 по умолчанию) |
| `CardDescription` | Подзаголовок | Краткое описание, мета-информация |
| `CardContent` | Основной контент | Изображения, текст, характеристики |
| `CardFooter` | Подвал карточки | **Кнопки действий**, ссылки |

### Пример Order Card

```typescript
function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Заказ #{order.id}</CardTitle>
          <Badge className={ORDER_STATUS_COLORS[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <CardDescription>
          {format(order.createdAt, 'dd MMMM yyyy')} · {order.items.length} товаров
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {order.items.slice(0, 3).map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.price} ₽</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold">
          <span>Итого</span>
          <span>{order.total} ₽</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/account/orders/${order.id}`}>
            Подробнее
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Варианты Button

```typescript
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

## Паттерны стилизации

### Card с hover эффектом

```typescript
// ✅ Хорошо — только shadow и border
<Card className="transition-shadow hover:shadow-lg hover:border-primary/50">
  {/* ... */}
</Card>

// ❌ Избегаем — scale влияет на производительность
<Card className="transition-transform hover:scale-105">
  {/* ... */}
</Card>
```

### Badge статусов

```typescript
const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

<Badge className={STATUS_COLORS[status]}>
  {STATUS_LABELS[status]}
</Badge>
```

### Gradient backgrounds

```typescript
// Hero section
<section className="bg-linear-to-br from-primary/10 via-background to-background py-16">

// Overlay на изображении
<div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

// CTA блок
<div className="bg-linear-to-r from-primary to-chart-2 text-white p-8 rounded-2xl">
```

### Skeleton loading

```typescript
<div className="h-96 animate-pulse rounded-xl bg-muted" />
```

### Responsive grid

```typescript
// 1 колонка mobile → 2 tablet → 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Line clamp (обрезка текста)

```typescript
<p className="line-clamp-2">
  Длинный текст будет обрезан после 2 строк...
</p>
```

### Sticky header

```typescript
<header className={cn(
  'sticky top-0 z-50 w-full transition-all',
  isScrolled
    ? 'bg-background/95 shadow-md backdrop-blur supports-backdrop-filter:bg-background/80'
    : 'bg-background'
)}>
```

## Анимации и производительность

### ⚠️ Избегаем избыточных анимаций

Анимации `scale`, `transform` на большом количестве элементов влияют на производительность.

```typescript
// ❌ ИЗБЕГАЕМ — scale на карточках
<Card className="hover:scale-105 transition-transform">

// ❌ ИЗБЕГАЕМ — transform на гридах
<div className="grid hover:scale-[1.02]">

// ✅ ХОРОШО — только opacity и shadow
<Card className="transition-shadow hover:shadow-lg">

// ✅ ХОРОШО — border color
<Card className="transition-colors hover:border-primary">
```

### Разрешённые анимации

```typescript
// Loading states — OK
<div className="animate-pulse" />     // Skeleton loading

// Иконки — OK  
<Loader className="animate-spin" />   // Spinner

// Единичные элементы — OK
<Button className="transition-colors hover:bg-primary/90" />
```

### Transition — правильное использование

```typescript
// ✅ Конкретные свойства
<div className="transition-shadow hover:shadow-lg" />
<div className="transition-colors hover:bg-muted" />
<div className="transition-opacity hover:opacity-80" />

// ❌ transition-all на карточках (включает transform)
<div className="transition-all hover:shadow-lg" />
```

### Custom animations (globals.css)

Только для единичных элементов (модалки, dropdown):

```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}
```

## Dark Mode

Проект поддерживает темную тему через CSS переменные:

```typescript
// Определение в CSS
.dark {
  --background: oklch(14.08% 0.004 286);
  --foreground: oklch(98.48% 0 0);
}

// Использование (автоматически)
<div className="bg-background text-foreground">
```

## Иконки

Используем [Lucide React](https://lucide.dev/):

```typescript
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  ChevronRight 
} from 'lucide-react';

<ShoppingCart className="h-5 w-5" />
```
