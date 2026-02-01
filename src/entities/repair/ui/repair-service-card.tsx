import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RepairService } from '../model/schemas';

interface RepairServiceCardProps {
  service: RepairService;
  onSelect?: (service: RepairService) => void;
}

export function RepairServiceCard({ service, onSelect }: RepairServiceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          {service.isPopular && (
            <Badge variant="secondary" className="shrink-0">
              Популярно
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{service.estimatedTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Стоимость</p>
            <p className="font-semibold">
              от {formatPrice(service.priceFrom)} ₽
              {service.priceTo && ` до ${formatPrice(service.priceTo)} ₽`}
            </p>
          </div>
          {onSelect && (
            <Button variant="outline" size="sm" onClick={() => onSelect(service)}>
              Выбрать
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
