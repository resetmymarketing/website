import { NextResponse } from 'next/server';
import { quickAddClientSchema } from '@/lib/validation';
import { sanitizeString, sanitizeEmail } from '@/lib/sanitize';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { validateOrigin, csrfError } from '@/lib/csrf';

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return csrfError();
    }

    await requireAuth();

    const body: unknown = await request.json();
    const parsed = quickAddClientSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, businessName, serviceType } = parsed.data;

    const result = await db
      .insert(clients)
      .values({
        status: 'inquiry',
        inquiryDate: new Date(),
        intakeData: {
          name: sanitizeString(name),
          email: sanitizeEmail(email),
          businessName: businessName ? sanitizeString(businessName) : '',
          serviceType: serviceType ? sanitizeString(serviceType) : '',
        },
      })
      .returning({ id: clients.id });

    return NextResponse.json({ id: result[0]?.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Unable to add client. Please try again.' },
      { status: 500 },
    );
  }
}
