'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export default function IntakePage() {
  const [quickAddState, setQuickAddState] = useState<FormState>({ status: 'idle' });
  const [intakeState, setIntakeState] = useState<FormState>({ status: 'idle' });

  async function handleQuickAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuickAddState({ status: 'submitting' });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      businessName: formData.get('businessName'),
      serviceType: formData.get('serviceType'),
    };

    try {
      const response = await fetch('/api/clients/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Failed to add client.';
        setQuickAddState({ status: 'error', message });
        return;
      }

      setQuickAddState({ status: 'success' });
      e.currentTarget.reset();
      setTimeout(() => setQuickAddState({ status: 'idle' }), 3000);
    } catch {
      setQuickAddState({ status: 'error', message: 'Unable to add client. Please try again.' });
    }
  }

  async function handleFullIntake(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntakeState({ status: 'submitting' });

    const formData = new FormData(e.currentTarget);
    const intakeData: Record<string, string> = {};

    // Collect all q-prefixed fields
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('q') && typeof value === 'string' && value.trim()) {
        intakeData[key] = value.trim();
      }
    }

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      intakeData,
    };

    try {
      const response = await fetch('/api/clients/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Failed to submit intake.';
        setIntakeState({ status: 'error', message });
        return;
      }

      setIntakeState({ status: 'success' });
    } catch {
      setIntakeState({ status: 'error', message: 'Unable to submit intake. Please try again.' });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Intake</h1>
      <p className="mt-1 text-warm-500">Add new clients or process full intake forms.</p>

      <Tabs defaultValue="quick-add" className="mt-8">
        <TabsList>
          <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
          <TabsTrigger value="full-intake">Full Intake</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-add">
          <Card className="border-warm-200">
            <CardHeader>
              <CardTitle className="text-lg text-brand-800">Quick Add Client</CardTitle>
              <CardDescription>
                Add a new inquiry with basic info. You can fill in the full intake later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickAdd} className="max-w-md space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="qa-name">Name *</Label>
                  <Input id="qa-name" name="name" required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-email">Email *</Label>
                  <Input id="qa-email" name="email" type="email" required maxLength={320} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-business">Business Name</Label>
                  <Input id="qa-business" name="businessName" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-service">Service Type</Label>
                  <Input id="qa-service" name="serviceType" maxLength={100} />
                </div>

                {quickAddState.status === 'error' && (
                  <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {quickAddState.message}
                  </p>
                )}
                {quickAddState.status === 'success' && (
                  <p role="status" className="rounded-md bg-sage-50 px-3 py-2 text-sm text-sage-700">
                    Client added successfully.
                  </p>
                )}

                <Button type="submit" disabled={quickAddState.status === 'submitting'}>
                  {quickAddState.status === 'submitting' ? 'Adding...' : 'Add Client'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full-intake">
          <Card className="border-warm-200">
            <CardHeader>
              <CardTitle className="text-lg text-brand-800">Full Intake Form</CardTitle>
              <CardDescription>
                Complete the detailed intake questionnaire for thorough analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {intakeState.status === 'success' ? (
                <div className="py-8 text-center">
                  <p className="text-lg font-medium text-sage-700">Intake submitted successfully.</p>
                  <p className="mt-2 text-warm-500">The client has been added to the pipeline.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIntakeState({ status: 'idle' })}
                  >
                    Submit another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFullIntake} className="max-w-2xl space-y-6" noValidate>
                  {/* Basic Info */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-warm-500">
                      Basic Information
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fi-name">Full Name *</Label>
                        <Input id="fi-name" name="name" required maxLength={200} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fi-email">Email *</Label>
                        <Input id="fi-email" name="email" type="email" required maxLength={320} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Business Overview */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-warm-500">
                      Business Overview
                    </legend>
                    <div className="space-y-2">
                      <Label htmlFor="q01">What is your business name?</Label>
                      <Input id="q01" name="q01" maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q02">What services do you offer?</Label>
                      <Textarea id="q02" name="q02" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q03">How long have you been in business?</Label>
                      <Input id="q03" name="q03" maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q04">Who is your ideal client?</Label>
                      <Textarea id="q04" name="q04" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q05">What makes your business different from others in your space?</Label>
                      <Textarea id="q05" name="q05" rows={3} maxLength={2000} />
                    </div>
                  </fieldset>

                  {/* Current Marketing */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-warm-500">
                      Current Marketing
                    </legend>
                    <div className="space-y-2">
                      <Label htmlFor="q06">What marketing platforms or channels are you currently using?</Label>
                      <Textarea id="q06" name="q06" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q07">What has worked for you in the past?</Label>
                      <Textarea id="q07" name="q07" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q08">What is not working right now?</Label>
                      <Textarea id="q08" name="q08" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q09">How much time per week can you realistically spend on marketing?</Label>
                      <Input id="q09" name="q09" maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q10">What is your biggest frustration with marketing right now?</Label>
                      <Textarea id="q10" name="q10" rows={3} maxLength={2000} />
                    </div>
                  </fieldset>

                  {/* Goals */}
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-warm-500">
                      Goals and Expectations
                    </legend>
                    <div className="space-y-2">
                      <Label htmlFor="q11">What would a successful outcome from this reset look like?</Label>
                      <Textarea id="q11" name="q11" rows={3} maxLength={2000} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q12">Is there anything specific you want addressed in your session?</Label>
                      <Textarea id="q12" name="q12" rows={3} maxLength={2000} />
                    </div>
                  </fieldset>

                  {intakeState.status === 'error' && (
                    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {intakeState.message}
                    </p>
                  )}

                  <Button type="submit" disabled={intakeState.status === 'submitting'}>
                    {intakeState.status === 'submitting' ? 'Submitting...' : 'Submit Intake'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
