import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Заказ оформлен',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const orderNumber = orderId ?? 'CL-000000';

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-8">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold">Заказ успешно оформлен!</h1>
          <p className="mb-6 text-muted-foreground">
            Номер заказа:{' '}
            <span className="font-mono font-semibold text-foreground">
              {orderNumber}
            </span>
          </p>

          <div className="mb-8 rounded-lg bg-muted/50 p-4 text-left">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Что дальше?</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Мы отправили подтверждение на вашу почту</li>
              <li>• Менеджер свяжется с вами для уточнения деталей</li>
              <li>• Вы можете отслеживать заказ в личном кабинете</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/account/orders">
                Мои заказы
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/catalog">
                Продолжить покупки
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
