'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: 'submitting' });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      businessName: formData.get('businessName'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Something went wrong. Please try again.';
        setFormState({ status: 'error', message });
        return;
      }

      setFormState({ status: 'success' });
    } catch {
      setFormState({
        status: 'error',
        message: 'Unable to send your message. Please check your connection and try again.',
      });
    }
  }

  if (formState.status === 'success') {
    return (
      <div className="flex min-h-[60vh] items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
            <Send className="h-7 w-7 text-sage-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-brand-800">Message sent.</h1>
          <p className="mt-3 text-warm-800">
            Thank you for reaching out. I will review your message and get back to you
            within one to two business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-[calc(100vh-5rem)]">
      {/* Left — image */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/collaboration.jpg"
          alt="Two women collaborating over a laptop, laughing and sharing ideas in a bright workspace"
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-brand-900/20" />
      </div>

      {/* Right — form */}
      <div className="flex items-center px-4 py-16 sm:px-6 lg:px-12 xl:px-20">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
            Get in Touch
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-800 sm:text-4xl">
            Let us start a conversation.
          </h1>
          <p className="mt-3 text-warm-800">
            Tell me a little about your business and what you are dealing with. No commitment,
            no pressure. Just a starting point.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                maxLength={200}
                autoComplete="name"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={320}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                maxLength={200}
                autoComplete="organization"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Tell me a little about your business and what you are looking for help with."
              />
            </div>

            {formState.status === 'error' && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {formState.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={formState.status === 'submitting'}
            >
              {formState.status === 'submitting' ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
