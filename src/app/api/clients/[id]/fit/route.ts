import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, clientNotes } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { fitAssessmentActionSchema } from '@/lib/validation';
import { sanitizeString } from '@/lib/sanitize';
import { assessFit } from '@/lib/fit-assessment';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const result = await db
      .select({ intakeData: clients.intakeData, fitRating: clients.fitRating })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    const client = result[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const assessment = assessFit(client.intakeData ?? null);

    return NextResponse.json({
      assessment,
      currentRating: client.fitRating,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to assess fit' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const body: unknown = await request.json();
    const parsed = fitAssessmentActionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { action, note } = parsed.data;

    // Get current client for scoring
    const result = await db
      .select({ intakeData: clients.intakeData })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    const client = result[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const assessment = assessFit(client.intakeData ?? null);

    if (action === 'accept') {
      await db
        .update(clients)
        .set({
          fitRating: assessment.rating,
          status: 'payment',
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id));
    } else {
      await db
        .update(clients)
        .set({
          fitRating: 'red',
          archetype: 'declined',
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id));
    }

    if (note) {
      await db.insert(clientNotes).values({
        clientId: id,
        noteType: 'interest_flag',
        content: sanitizeString(note),
      });
    }

    return NextResponse.json({
      action,
      rating: action === 'accept' ? assessment.rating : 'red',
      assessment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to process fit assessment' }, { status: 500 });
  }
}
