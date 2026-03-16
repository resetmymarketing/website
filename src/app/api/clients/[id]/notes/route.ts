import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientNotes } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { noteSchema } from '@/lib/validation';
import { sanitizeString } from '@/lib/sanitize';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const notes = await db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, id))
      .orderBy(desc(clientNotes.createdAt));

    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
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
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { content, noteType } = parsed.data;

    const result = await db
      .insert(clientNotes)
      .values({
        clientId: id,
        noteType,
        content: sanitizeString(content),
      })
      .returning({ id: clientNotes.id });

    return NextResponse.json({ id: result[0]?.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
