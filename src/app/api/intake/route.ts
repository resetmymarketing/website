import { NextResponse } from 'next/server';
import { publicIntakeSchema } from '@/lib/validation';
import { sanitizeString, sanitizeEmail } from '@/lib/sanitize';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { validateOrigin, csrfError } from '@/lib/csrf';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const INTAKE_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
};

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) {
      return csrfError();
    }

    const key = `intake:${getRateLimitKey(request)}`;
    const rateLimit = checkRateLimit(key, INTAKE_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const parsed = publicIntakeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Build sanitized intake JSONB object
    const intakeData: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === 'q48_consent') continue; // boolean, not stored in JSONB
      if (value === undefined || value === null || value === '') continue;

      if (Array.isArray(value)) {
        intakeData[key] = value.map((v) => sanitizeString(v));
      } else if (typeof value === 'number') {
        intakeData[key] = String(value);
      } else {
        intakeData[key] = key === 'q03_email' ? sanitizeEmail(value) : sanitizeString(value);
      }
    }

    await db.insert(clients).values({
      status: 'intake_submitted',
      inquiryDate: new Date(),
      intakeDate: new Date(),
      intakeData,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process your intake form. Please try again later.' },
      { status: 500 },
    );
  }
}
