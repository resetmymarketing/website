import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { stageTransitionSchema } from '@/lib/validation';

const stageDateFields: Record<string, keyof typeof clients> = {
  inquiry: 'inquiryDate',
  intake_submitted: 'intakeDate',
  payment: 'paymentDate',
  session_scheduled: 'sessionDate',
  deliverables_sent: 'deliverablesSentDate',
  followup_scheduled: 'followupDate',
  followup_complete: 'followupCompleteDate',
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const body: unknown = await request.json();
    const parsed = stageTransitionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { newStage } = parsed.data;

    // Build the update object
    const updateData: Record<string, unknown> = {
      status: newStage,
      updatedAt: new Date(),
    };

    // Set the corresponding date field if one exists
    const dateField = stageDateFields[newStage];
    if (dateField) {
      updateData[dateField as string] = new Date();
    }

    const result = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning({ id: clients.id, status: clients.status });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client: result[0] });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
  }
}
