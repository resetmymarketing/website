import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deliverables } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { deliverableUpdateSchema } from '@/lib/validation';
import { sanitizeString } from '@/lib/sanitize';
import { z } from 'zod';

const createDeliverableSchema = z.object({
  deliverableType: z.string().min(1).max(200),
  content: z.string().max(50000).optional(),
  notes: z.string().max(5000).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const clientDeliverables = await db
      .select()
      .from(deliverables)
      .where(eq(deliverables.clientId, id));

    return NextResponse.json({ deliverables: clientDeliverables });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
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
    const parsed = createDeliverableSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { deliverableType, content, notes } = parsed.data;

    const result = await db
      .insert(deliverables)
      .values({
        clientId: id,
        deliverableType: sanitizeString(deliverableType),
        content: content ? sanitizeString(content) : null,
        notes: notes ? sanitizeString(notes) : null,
      })
      .returning({ id: deliverables.id });

    return NextResponse.json({ id: result[0]?.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const url = new URL(request.url);
    const deliverableId = url.searchParams.get('deliverableId');

    if (!deliverableId) {
      return NextResponse.json({ error: 'deliverableId query param required' }, { status: 400 });
    }

    const body: unknown = await request.json();
    const parsed = deliverableUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.content !== undefined) updateData.content = sanitizeString(parsed.data.content);
    if (parsed.data.notes !== undefined) updateData.notes = sanitizeString(parsed.data.notes);

    if (parsed.data.status === 'generated') {
      updateData.generatedAt = new Date();
    }
    if (parsed.data.status === 'sent') {
      updateData.sentAt = new Date();
    }

    const result = await db
      .update(deliverables)
      .set(updateData)
      .where(and(eq(deliverables.id, deliverableId), eq(deliverables.clientId, id)))
      .returning({ id: deliverables.id, status: deliverables.status });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    return NextResponse.json({ deliverable: result[0] });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 });
  }
}
