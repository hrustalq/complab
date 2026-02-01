import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, getOrderByNumber, updateOrderStatus } from '@/entities/order/api/handlers';
import { updateOrderStatusSchema } from '../schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try by ID first, then by order number
    let order = await getOrderById(id);

    if (!order) {
      order = await getOrderByNumber(id);
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validated = updateOrderStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { status, comment } = validated.data;

    const order = await updateOrderStatus(id, status, comment);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
