import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = {
  title: 'Clients',
};

export const dynamic = 'force-dynamic';

function getClientName(intakeData: Record<string, string | string[]> | null): string {
  if (!intakeData) return 'Unknown';
  const name = intakeData['name'];
  return typeof name === 'string' && name ? name : 'Unknown';
}

function getClientEmail(intakeData: Record<string, string | string[]> | null): string {
  if (!intakeData) return '';
  const email = intakeData['email'];
  return typeof email === 'string' ? email : '';
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

const stageColors: Record<string, string> = {
  inquiry: 'bg-warm-200 text-warm-700',
  intake_submitted: 'bg-brand-100 text-brand-700',
  fit_assessment: 'bg-brand-200 text-brand-800',
  payment: 'bg-sage-100 text-sage-700',
  analysis_prep: 'bg-sage-200 text-sage-800',
  session_scheduled: 'bg-brand-300 text-brand-800',
  session_complete: 'bg-sage-300 text-sage-800',
  deliverables_sent: 'bg-sage-400 text-white',
  followup_scheduled: 'bg-brand-400 text-white',
  followup_complete: 'bg-sage-700 text-white',
};

export default async function ClientsPage() {
  const allClients = await db
    .select({
      id: clients.id,
      status: clients.status,
      fitRating: clients.fitRating,
      intakeData: clients.intakeData,
      createdAt: clients.createdAt,
      pricePaid: clients.pricePaid,
    })
    .from(clients)
    .orderBy(desc(clients.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Clients</h1>
          <p className="mt-1 text-warm-500">Manage client records and details.</p>
        </div>
        <ButtonLink href="/dashboard/intake">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </ButtonLink>
      </div>

      {allClients.length > 0 ? (
        <div className="mt-8 space-y-3">
          {allClients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="block">
              <Card className="border-warm-200 transition-colors hover:border-brand-300">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    {client.fitRating && (
                      <span
                        className={`h-3 w-3 rounded-full ${
                          client.fitRating === 'green'
                            ? 'bg-green-500'
                            : client.fitRating === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        aria-label={`Fit rating: ${client.fitRating}`}
                      />
                    )}
                    <div>
                      <p className="font-medium text-warm-800">
                        {getClientName(client.intakeData)}
                      </p>
                      <p className="text-sm text-warm-500">{getClientEmail(client.intakeData)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={stageColors[client.status] ?? 'bg-warm-100 text-warm-700'}
                    >
                      {stageLabels[client.status] ?? client.status}
                    </Badge>
                    <span className="text-sm text-warm-400">
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mt-8 border-warm-200">
          <CardHeader>
            <CardTitle className="text-lg text-warm-600">No clients yet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-100">
              <Users className="h-8 w-8 text-warm-400" />
            </div>
            <p className="mt-4 text-warm-500">
              Clients will appear here once they are added through the intake form or quick-add.
            </p>
            <ButtonLink href="/dashboard/intake" variant="outline" className="mt-4">
              Add your first client
            </ButtonLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
