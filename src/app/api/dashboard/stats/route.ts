import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, revenueEntries } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { sql, count, sum } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAuth();

    // Total clients
    const totalResult = await db
      .select({ count: count() })
      .from(clients);
    const totalClients = totalResult[0]?.count ?? 0;

    // Clients by stage
    const stageResults = await db
      .select({
        status: clients.status,
        count: count(),
      })
      .from(clients)
      .groupBy(clients.status);

    const stageCounts: Record<string, number> = {};
    for (const row of stageResults) {
      stageCounts[row.status] = row.count;
    }

    // Active pipeline (not done/declined)
    const doneCount = stageCounts['followup_complete'] ?? 0;
    const inPipeline = totalClients - doneCount;

    // Intake pending
    const intakePending = stageCounts['intake_submitted'] ?? 0;

    // Total revenue
    const revenueResult = await db
      .select({ total: sum(revenueEntries.amount) })
      .from(revenueEntries);
    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    // Fit rating distribution
    const fitResults = await db
      .select({
        fitRating: clients.fitRating,
        count: count(),
      })
      .from(clients)
      .where(sql`${clients.fitRating} IS NOT NULL`)
      .groupBy(clients.fitRating);

    const fitDistribution: Record<string, number> = {};
    for (const row of fitResults) {
      if (row.fitRating) {
        fitDistribution[row.fitRating] = row.count;
      }
    }

    // Recent clients (last 5)
    const recentClients = await db
      .select({
        id: clients.id,
        status: clients.status,
        intakeData: clients.intakeData,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .orderBy(sql`${clients.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      totalClients,
      inPipeline,
      intakePending,
      totalRevenue,
      stageCounts,
      fitDistribution,
      recentClients,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
