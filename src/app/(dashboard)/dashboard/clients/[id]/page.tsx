'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

const stageOrder = [
  'inquiry',
  'intake_submitted',
  'fit_assessment',
  'payment',
  'analysis_prep',
  'session_scheduled',
  'session_complete',
  'deliverables_sent',
  'followup_scheduled',
  'followup_complete',
];

interface ClientData {
  id: string;
  status: string;
  fitRating: string | null;
  archetype: string | null;
  intakeData: Record<string, string | string[]> | null;
  pricePaid: number | null;
  createdAt: string;
}

interface Note {
  id: string;
  noteType: string;
  content: string;
  createdAt: string;
}

interface Deliverable {
  id: string;
  deliverableType: string;
  status: string;
  content: string | null;
  notes: string | null;
  generatedAt: string | null;
  sentAt: string | null;
}

interface FitAssessment {
  rating: string;
  score: number;
  flags: Array<{ label: string; met: boolean; reason: string }>;
  summary: string;
}

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

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [client, setClient] = useState<ClientData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [clientDeliverables, setClientDeliverables] = useState<Deliverable[]>([]);
  const [fitAssessment, setFitAssessment] = useState<FitAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [newDeliverableType, setNewDeliverableType] = useState('');

  const loadClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setNotes(data.notes);
        setClientDeliverables(data.deliverables);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  async function runFitAssessment() {
    const res = await fetch(`/api/clients/${clientId}/fit`);
    if (res.ok) {
      const data = await res.json();
      setFitAssessment(data.assessment);
    }
  }

  async function acceptFit() {
    const res = await fetch(`/api/clients/${clientId}/fit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' }),
    });
    if (res.ok) {
      await loadClient();
      await runFitAssessment();
    }
  }

  async function declineFit(note: string) {
    const res = await fetch(`/api/clients/${clientId}/fit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline', note }),
    });
    if (res.ok) {
      await loadClient();
    }
  }

  async function advanceStage() {
    if (!client) return;
    const currentIdx = stageOrder.indexOf(client.status);
    if (currentIdx < 0 || currentIdx >= stageOrder.length - 1) return;
    const nextStage = stageOrder[currentIdx + 1];

    const res = await fetch(`/api/clients/${clientId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStage: nextStage }),
    });
    if (res.ok) {
      await loadClient();
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const res = await fetch(`/api/clients/${clientId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote, noteType: 'general' }),
    });
    if (res.ok) {
      setNewNote('');
      await loadClient();
    }
  }

  async function addDeliverable() {
    if (!newDeliverableType.trim()) return;
    const res = await fetch(`/api/clients/${clientId}/deliverables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverableType: newDeliverableType }),
    });
    if (res.ok) {
      setNewDeliverableType('');
      await loadClient();
    }
  }

  async function updateDeliverableStatus(deliverableId: string, status: string) {
    const res = await fetch(
      `/api/clients/${clientId}/deliverables?deliverableId=${deliverableId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    );
    if (res.ok) {
      await loadClient();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-warm-500">Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-warm-500">Client not found.</p>
      </div>
    );
  }

  const currentStageIdx = stageOrder.indexOf(client.status);
  const canAdvance = currentStageIdx >= 0 && currentStageIdx < stageOrder.length - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">
            {getClientName(client.intakeData)}
          </h1>
          <p className="text-warm-500">{getClientEmail(client.intakeData)}</p>
        </div>
        <div className="flex items-center gap-3">
          {client.fitRating && (
            <Badge
              className={
                client.fitRating === 'green'
                  ? 'bg-green-100 text-green-700'
                  : client.fitRating === 'yellow'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }
            >
              Fit: {client.fitRating}
            </Badge>
          )}
          <Badge variant="outline">
            {stageLabels[client.status] ?? client.status}
          </Badge>
        </div>
      </div>

      {/* Stage progression */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="text-lg text-brand-800">Pipeline Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stageOrder.map((stage, idx) => (
              <span
                key={stage}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  idx <= currentStageIdx
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-warm-100 text-warm-400'
                }`}
              >
                {stageLabels[stage]}
              </span>
            ))}
          </div>
          {canAdvance && (
            <Button onClick={advanceStage} className="mt-4" size="sm">
              Advance to {stageLabels[stageOrder[currentStageIdx + 1]]}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Fit Assessment */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="text-lg text-brand-800">Fit Assessment</CardTitle>
          <CardDescription>Evaluate whether this client is a good fit for a reset.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runFitAssessment} variant="outline" size="sm">
            Run Assessment
          </Button>
          {fitAssessment && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    fitAssessment.rating === 'green'
                      ? 'bg-green-100 text-green-700'
                      : fitAssessment.rating === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }
                >
                  {fitAssessment.rating.toUpperCase()} ({fitAssessment.score}/100)
                </Badge>
              </div>
              <p className="text-sm text-warm-600">{fitAssessment.summary}</p>
              <ul className="space-y-1">
                {fitAssessment.flags.map((flag) => (
                  <li key={flag.label} className="flex items-center gap-2 text-sm">
                    <span className={flag.met ? 'text-green-600' : 'text-red-500'}>
                      {flag.met ? 'Pass' : 'Fail'}
                    </span>
                    <span className="text-warm-700">{flag.label}</span>
                    <span className="text-warm-400">- {flag.reason}</span>
                  </li>
                ))}
              </ul>
              {!client.fitRating && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={acceptFit} size="sm">
                    Accept (set rating)
                  </Button>
                  <Button
                    onClick={() => declineFit('Declined after assessment')}
                    variant="outline"
                    size="sm"
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intake Data */}
      {client.intakeData && (
        <Card className="border-warm-200">
          <CardHeader>
            <CardTitle className="text-lg text-brand-800">Intake Data</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(client.intakeData).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <dt className="text-xs font-medium uppercase text-warm-400">{key}</dt>
                  <dd className="text-sm text-warm-700">
                    {Array.isArray(value) ? value.join(', ') : value || '-'}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="text-lg text-brand-800">Deliverables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clientDeliverables.length > 0 ? (
            <ul className="space-y-3">
              {clientDeliverables.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-md border border-warm-100 px-3 py-2">
                  <div>
                    <p className="font-medium text-warm-700">{d.deliverableType}</p>
                    <p className="text-xs text-warm-400">
                      {d.status === 'sent' && d.sentAt
                        ? `Sent ${new Date(d.sentAt).toLocaleDateString()}`
                        : d.status}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {d.status === 'not_started' && (
                      <Button size="sm" variant="outline" onClick={() => updateDeliverableStatus(d.id, 'in_progress')}>
                        Start
                      </Button>
                    )}
                    {d.status === 'in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => updateDeliverableStatus(d.id, 'generated')}>
                        Mark Generated
                      </Button>
                    )}
                    {d.status === 'generated' && (
                      <Button size="sm" variant="outline" onClick={() => updateDeliverableStatus(d.id, 'sent')}>
                        Mark Sent
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-warm-400">No deliverables yet.</p>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-deliverable">Add Deliverable</Label>
              <Input
                id="new-deliverable"
                placeholder="e.g., Brand Voice Guide"
                value={newDeliverableType}
                onChange={(e) => setNewDeliverableType(e.target.value)}
                maxLength={200}
              />
            </div>
            <Button onClick={addDeliverable} size="sm">
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="text-lg text-brand-800">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.length > 0 ? (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-md border border-warm-100 px-3 py-2">
                  <p className="text-sm text-warm-700">{n.content}</p>
                  <p className="mt-1 text-xs text-warm-400">
                    {n.noteType} - {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-warm-400">No notes yet.</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-note">Add Note</Label>
            <Textarea
              id="new-note"
              placeholder="Write a note about this client..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              maxLength={5000}
            />
            <Button onClick={addNote} size="sm">
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
