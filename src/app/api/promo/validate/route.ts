import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkPromoCode } from '@/entities/order/api/handlers';

const validatePromoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validated = validatePromoCodeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { code } = validated.data;
    const result = checkPromoCode(code);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
