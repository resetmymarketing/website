import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { count } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = {
  title: 'Pipeline',
};

export const dynamic = 'force-dynamic';

const stages = [
  { key: 'inquiry', label: 'Inquiry', color: 'bg-warm-200 text-warm-700' },
  { key: 'intake_submitted', label: 'Intake', color: 'bg-brand-100 text-brand-700' },
  { key: 'fit_assessment', label: 'Fit Check', color: 'bg-brand-200 text-brand-800' },
  { key: 'payment', label: 'Payment', color: 'bg-sage-100 text-sage-700' },
  { key: 'analysis_prep', label: 'Analysis', color: 'bg-sage-200 text-sage-800' },
  { key: 'session_scheduled', label: 'Scheduled', color: 'bg-brand-300 text-brand-800' },
  { key: 'session_complete', label: 'Complete', color: 'bg-sage-300 text-sage-800' },
  { key: 'deliverables_sent', label: 'Delivered', color: 'bg-sage-400 text-white' },
  { key: 'followup_scheduled', label: 'Follow-up', color: 'bg-brand-400 text-white' },
  { key: 'followup_complete', label: 'Done', color: 'bg-sage-700 text-white' },
] as const;

function getClientName(intakeData: Record<string, string | string[]> | null): string {
  if (!intakeData) return 'Unknown';
  const name = intakeData['name'];
  return typeof name === 'string' && name ? name : 'Unknown';
}

async function getPipelineData() {
  const countResults = await db
    .select({ status: clients.status, count: count() })
    .from(clients)
    .groupBy(clients.status);

  const stageCounts: Record<string, number> = {};
  for (const row of countResults) {
    stageCounts[row.status] = row.count;
  }

  const allClients = await db
    .select({
      id: clients.id,
      status: clients.status,
      intakeData: clients.intakeData,
      fitRating: clients.fitRating,
    })
    .from(clients);

  const clientsByStage: Record<string, typeof allClients> = {};
  for (const client of allClients) {
    if (!clientsByStage[client.status]) {
      clientsByStage[client.status] = [];
    }
    clientsByStage[client.status].push(client);
  }

  return { stageCounts, clientsByStage };
}

export default async function PipelinePage() {
  const { stageCounts, clientsByStage } = await getPipelineData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Pipeline</h1>
      <p className="mt-1 text-warm-500">Track clients through each stage of the process.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stages.map((stage) => {
          const stageClients = clientsByStage[stage.key] ?? [];
          return (
            <Card key={stage.key} className="border-warm-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="text-warm-700">{stage.label}</span>
                  <Badge variant="secondary" className={stage.color}>
                    {stageCounts[stage.key] ?? 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stageClients.length > 0 ? (
                  <ul className="space-y-2">
                    {stageClients.map((client) => (
                      <li key={client.id}>
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="block rounded-md px-2 py-1 text-xs text-warm-700 transition-colors hover:bg-warm-50"
                        >
                          {getClientName(client.intakeData)}
                          {client.fitRating && (
                            <span
                              className={`ml-1 inline-block h-2 w-2 rounded-full ${
                                client.fitRating === 'green'
                                  ? 'bg-green-500'
                                  : client.fitRating === 'yellow'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              aria-label={`Fit rating: ${client.fitRating}`}
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-xs text-warm-400">No clients in this stage</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
