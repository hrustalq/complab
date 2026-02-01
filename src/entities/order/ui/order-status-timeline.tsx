import { Check, Circle, Clock } from 'lucide-react';
import type { OrderStatusHistory, OrderStatus } from '../model/schemas';
import { ORDER_STATUS_LABELS } from '../model/schemas';

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistory[];
  currentStatus: OrderStatus;
}

const statusOrder: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export function OrderStatusTimeline({
  statusHistory,
  currentStatus,
}: OrderStatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'returned';

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusFromHistory = (status: OrderStatus) => {
    return statusHistory.find((h) => h.status === status);
  };

  if (isCancelled) {
    return (
      <div className="space-y-4">
        {statusHistory.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  item.status === 'cancelled' || item.status === 'returned'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                <Check className="h-4 w-4" />
              </div>
              {index < statusHistory.length - 1 && (
                <div className="h-8 w-0.5 bg-border" />
              )}
            </div>
            <div className="pb-4">
              <p className="font-medium">{ORDER_STATUS_LABELS[item.status]}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(item.timestamp)}
              </p>
              {item.comment && (
                <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusOrder.map((status, index) => {
        const historyItem = getStatusFromHistory(status);
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {index < statusOrder.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    index < currentIndex ? 'bg-green-200' : 'bg-border'
                  }`}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={`font-medium ${
                  !isCompleted && 'text-muted-foreground'
                }`}
              >
                {ORDER_STATUS_LABELS[status]}
              </p>
              {historyItem && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(historyItem.timestamp)}
                  </p>
                  {historyItem.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {historyItem.comment}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
