import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAuth();

    const allClients = await db
      .select({
        id: clients.id,
        status: clients.status,
        fitRating: clients.fitRating,
        archetype: clients.archetype,
        intakeData: clients.intakeData,
        inquiryDate: clients.inquiryDate,
        pricePaid: clients.pricePaid,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .orderBy(desc(clients.createdAt));

    return NextResponse.json({ clients: allClients });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
