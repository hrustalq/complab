import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  getUserOrders,
  createOrder,
} from '@/entities/order/api/handlers';
import { createOrderRequestSchema } from '@/entities/order/model/schemas';
import { parseSearchParamsStrict } from '@/shared/api/search-params';
import { getOrdersQuerySchema } from './schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = parseSearchParamsStrict(searchParams, getOrdersQuerySchema);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const query = result.data;

    // Simple list without pagination
    if (query.simple) {
      const orders = await getUserOrders(query.userId);
      return NextResponse.json({ orders });
    }

    // With pagination
    const ordersResult = await getOrders({
      userId: query.userId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });

    return NextResponse.json(ordersResult);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...orderData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const validated = createOrderRequestSchema.safeParse(orderData);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const order = await createOrder(userId, validated.data);

    if (!order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
