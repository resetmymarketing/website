import { NextResponse } from 'next/server';
import { fullIntakeSchema } from '@/lib/validation';
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
    const parsed = fullIntakeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, intakeData } = parsed.data;

    // Sanitize all intake fields
    const sanitizedIntake: Record<string, string | string[]> = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
    };

    for (const [key, value] of Object.entries(intakeData)) {
      if (Array.isArray(value)) {
        sanitizedIntake[key] = value.map((v) => sanitizeString(v));
      } else {
        sanitizedIntake[key] = sanitizeString(value);
      }
    }

    const result = await db
      .insert(clients)
      .values({
        status: 'intake_submitted',
        inquiryDate: new Date(),
        intakeDate: new Date(),
        intakeData: sanitizedIntake,
      })
      .returning({ id: clients.id });

    return NextResponse.json({ id: result[0]?.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Unable to process intake. Please try again.' },
      { status: 500 },
    );
  }
}
