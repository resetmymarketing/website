import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, clientNotes, deliverables } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await params;

    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    const client = result[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const notes = await db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, id));

    const clientDeliverables = await db
      .select()
      .from(deliverables)
      .where(eq(deliverables.clientId, id));

    return NextResponse.json({ client, notes, deliverables: clientDeliverables });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}
