import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button-link';
import { Users, GitBranch, ClipboardList, DollarSign } from 'lucide-react';
import { db } from '@/lib/db';
import { clients, revenueEntries } from '@/lib/schema';
import { count, sum, desc } from 'drizzle-orm';

export const metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

async function getStats() {
  const totalResult = await db.select({ count: count() }).from(clients);
  const totalClients = totalResult[0]?.count ?? 0;

  const stageResults = await db
    .select({ status: clients.status, count: count() })
    .from(clients)
    .groupBy(clients.status);

  const stageCounts: Record<string, number> = {};
  for (const row of stageResults) {
    stageCounts[row.status] = row.count;
  }

  const doneCount = stageCounts['followup_complete'] ?? 0;
  const inPipeline = totalClients - doneCount;
  const intakePending = stageCounts['intake_submitted'] ?? 0;

  const revenueResult = await db
    .select({ total: sum(revenueEntries.amount) })
    .from(revenueEntries);
  const totalRevenue = Number(revenueResult[0]?.total ?? 0);

  const recentClients = await db
    .select({
      id: clients.id,
      status: clients.status,
      intakeData: clients.intakeData,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .orderBy(desc(clients.createdAt))
    .limit(5);

  return { totalClients, inPipeline, intakePending, totalRevenue, recentClients };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function getClientName(intakeData: Record<string, string | string[]> | null): string {
  if (!intakeData) return 'Unknown';
  const name = intakeData['name'];
  return typeof name === 'string' && name ? name : 'Unknown';
}

const stageLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  intake_submitted: 'Intake',
  fit_assessment: 'Fit Check',
  payment: 'Payment',
  analysis_prep: 'Analysis',
  session_scheduled: 'Scheduled',
  session_complete: 'Complete',
  deliverables_sent: 'Delivered',
  followup_scheduled: 'Follow-up',
  followup_complete: 'Done',
};

export default async function DashboardPage() {
  const { totalClients, inPipeline, intakePending, totalRevenue, recentClients } =
    await getStats();

  const stats = [
    {
      label: 'Total Clients',
      value: String(totalClients),
      icon: Users,
      color: 'text-brand-600 bg-brand-100',
    },
    {
      label: 'In Pipeline',
      value: String(inPipeline),
      icon: GitBranch,
      color: 'text-sage-600 bg-sage-100',
    },
    {
      label: 'Intake Pending',
      value: String(intakePending),
      icon: ClipboardList,
      color: 'text-brand-500 bg-brand-50',
    },
    {
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-sage-700 bg-sage-100',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Overview</h1>
      <p className="mt-1 text-warm-500">Welcome to the Reset My Marketing operations dashboard.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-warm-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-warm-500">{stat.label}</CardTitle>
              <div className={`rounded-md p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentClients.length > 0 ? (
        <div className="mt-8">
          <Card className="border-warm-200">
            <CardHeader>
              <CardTitle className="text-lg text-brand-800">Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-warm-100">
                {recentClients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-warm-800">
                        {getClientName(client.intakeData)}
                      </p>
                      <p className="text-sm text-warm-500">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-warm-700">
                      {stageLabels[client.status] ?? client.status}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mt-8">
          <Card className="border-warm-200">
            <CardHeader>
              <CardTitle className="text-lg text-brand-800">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-warm-600">
              <p>
                Your dashboard is ready. Once clients start coming through the pipeline, you will
                see activity here.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>
                  Use <strong>Pipeline</strong> to track clients through each stage
                </li>
                <li>
                  Use <strong>Clients</strong> to view details and manage individual records
                </li>
                <li>
                  Use <strong>Intake</strong> to quick-add new inquiries or review full intake forms
                </li>
              </ul>
              <ButtonLink href="/dashboard/intake" className="mt-2">
                Add your first client
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
