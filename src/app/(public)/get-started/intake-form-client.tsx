'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { IntakeProgressBar } from '@/components/intake/intake-progress-bar';
import { IntakeStepNav } from '@/components/intake/intake-step-nav';
import { IntakeConfirmationCard } from '@/components/intake/intake-confirmation-card';
import { IntakeLinkTable } from '@/components/intake/intake-link-table';
import { TOTAL_INTAKE_STEPS } from './intake-steps';
import {
  useReducedMotion,
  slideVariants,
  reducedSlideVariants,
  springs,
  fade,
} from '@/lib/motion';

type FormData = Record<string, string | number | null>;
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const DRAFT_KEY = 'tmr-intake-draft';

// --- Label mappings for concierge pre-filled values ---

const stageLabels: Record<string, string> = {
  just_starting: 'Just starting out',
  inconsistent: 'Established but inconsistent',
  fully_booked: 'Fully booked',
  overwhelmed: 'Overwhelmed',
  stagnant: 'Stagnant or plateaued',
  other: 'Other',
};

const goalLabels: Record<string, string> = {
  more_clients: 'More clients',
  consistent_bookings: 'More consistent bookings',
  better_fit: 'Better-fit clients',
  increase_pricing: 'Increase my pricing',
  free_up_schedule: 'Free up my schedule',
};

const approachLabels: Record<string, string> = {
  no_marketing: 'Word of mouth only',
  occasional: 'Occasional posting',
  regular_no_results: 'Regular but not working',
  referrals_only: 'Referrals and repeats',
  tried_unclear: 'Tried everything',
  overwhelmed: 'Do not know where to start',
  wrong_clients: 'Working but attracting the wrong clients',
};

const constraintLabels: Record<string, string> = {
  money: 'Money',
  confidence: 'Confidence',
  consistency: 'Consistency',
  clarity: 'Clarity',
  direction: 'Direction',
  time_energy: 'Time and energy',
  alignment: 'Uncertainty about alignment',
};

// --- Shared UI components ---

function SectionHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="pt-10 pb-4 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-brand-200">
          {number}
        </span>
        <h2 className="text-xl font-bold text-brand-800">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-warm-800">{description}</p>
      <div className="mt-4 h-px bg-brand-200" />
    </div>
  );
}

function SectionDivider({ title, note }: { title: string; note?: string }) {
  return (
    <div className="pt-8 pb-2">
      <h3 className="text-lg font-semibold text-brand-800">{title}</h3>
      {note && <p className="mt-1 text-sm text-warm-600">{note}</p>}
      <div className="mt-3 h-px bg-brand-200" />
    </div>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-warm-600">{children}</p>;
}

function RadioGroup({
  name, label, options, value, onChange, required = false,
}: {
  name: string; label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-brand-800">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-brand-600"
            />
            <span className="text-sm text-warm-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  label, options, value, onChange, required = false, helperText,
}: {
  label: string; options: { value: string; label: string }[];
  value: string[]; onChange: (v: string[]) => void; required?: boolean;
  helperText?: string;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-brand-800">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>
      {helperText && <HelperText>{helperText}</HelperText>}
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="mt-0.5 accent-brand-600"
            />
            <span className="text-sm text-warm-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function loadDraft(): { form: FormData; checkboxFields: Record<string, string[]>; step: number } | null {
  try {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (!draft) return null;
    return JSON.parse(draft) as { form: FormData; checkboxFields: Record<string, string[]>; step: number };
  } catch {
    return null;
  }
}

const defaultCheckboxFields: Record<string, string[]> = {
  q17_client_sources: [],
  q22_q23_marketing_feelings: [],
  q25_platforms_used: [],
  q28_stopped_reason: [],
  q37_help_wanted: [],
  q39_biggest_constraints: [],
  q40c_content_enjoyment: [],
};

export function IntakeFormClient() {
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });
  const [direction, setDirection] = useState(1);

  // Build initial state from URL params + sessionStorage draft
  const initialData = useMemo(() => {
    const draft = loadDraft();
    const prefills: Record<string, string> = {};
    const prefillCheckboxes: Record<string, string[]> = {};

    const q11 = searchParams.get('q11');
    const q11Other = searchParams.get('q11_other');
    const q12 = searchParams.get('q12');
    const q21 = searchParams.get('q21');
    const q39 = searchParams.get('q39');

    if (q11) prefills.q11_current_stage = q11;
    if (q11Other) prefills.q11_current_stage_other = q11Other;
    if (q12) prefills.q12_primary_goal = q12;
    if (q21) prefills.q21_marketing_approach = q21;
    if (q39) prefillCheckboxes.q39_biggest_constraints = q39.split(',').filter(Boolean);

    return {
      form: { ...(draft?.form ?? {}), ...prefills },
      checkboxFields: { ...defaultCheckboxFields, ...(draft?.checkboxFields ?? {}), ...prefillCheckboxes },
      step: draft?.step ?? 0,
    };
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(initialData.step);
  const [form, setForm] = useState<FormData>(initialData.form);
  const [checkboxFields, setCheckboxFields] = useState<Record<string, string[]>>(initialData.checkboxFields);
  const [consent, setConsent] = useState(false);

  // Save draft to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, checkboxFields, step: currentStep }),
      );
    } catch {
      // sessionStorage unavailable
    }
  }, [form, checkboxFields, currentStep]);

  function set(key: string, value: string | number | null) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function str(key: string): string {
    return (form[key] as string) ?? '';
  }

  const socialActive = str('q24_social_active');
  const showActivePosters = socialActive === 'yes' || socialActive === 'sometimes';
  const showNonPosters = socialActive === 'rarely_never';

  const techComfort = str('q35_q36_tech_comfort');
  const showAiFrequency = techComfort !== '' && techComfort !== 'avoid_tech';

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_INTAKE_STEPS - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (currentStep < TOTAL_INTAKE_STEPS - 1) {
      goNext();
      return;
    }

    setFormState({ status: 'submitting' });

    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(form)) {
      if (value !== null && value !== '') {
        payload[key] = value;
      }
    }

    for (const [key, arr] of Object.entries(checkboxFields)) {
      if (arr.length > 0) {
        payload[key] = arr;
      }
    }

    payload.q48_consent = consent;

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore
      }
    } catch {
      setFormState({
        status: 'error',
        message: 'Unable to send your form. Please check your connection and try again.',
      });
    }
  }

  // --- Confirmation card helpers ---

  function getStageLabel(): string {
    const val = str('q11_current_stage');
    if (val === 'other') {
      return str('q11_current_stage_other') || 'Other';
    }
    return stageLabels[val] || val;
  }

  function getGoalLabel(): string {
    const val = str('q12_primary_goal');
    return goalLabels[val] || val;
  }

  function getApproachLabel(): string {
    const val = str('q21_marketing_approach');
    return approachLabels[val] || val;
  }

  function getConstraintsLabel(): string {
    const vals = checkboxFields.q39_biggest_constraints;
    if (vals.length === 0) return '';
    return vals.map(v => constraintLabels[v] || v).join(', ');
  }

  function handleConfirmationChange(_formField: string) {
    // For now, scroll to a note about going back to the concierge
    const note = document.getElementById('concierge-change-note');
    if (note) note.scrollIntoView({ behavior: 'smooth' });
  }

  // --- Link table onChange handler ---

  function handleLinkChange(key: string, value: string) {
    set(key, value);
  }

  if (formState.status === 'success') {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <Send className="h-7 w-7 text-sage-600" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-brand-800">Consultation received.</h2>
        <p className="mt-3 text-warm-800 max-w-md mx-auto">
          Thank you for taking the time to fill this out. I will review everything and be in touch
          within one to two business days to discuss next steps.
        </p>
      </div>
    );
  }

  const variants = reducedMotion ? reducedSlideVariants : slideVariants;
  const transition = reducedMotion ? fade : springs.snappy;

  return (
    <div>
      <IntakeProgressBar currentStep={currentStep} />

      <form onSubmit={handleSubmit} noValidate>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {/* STEP 0: Business Snapshot + Online Presence */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <SectionHeader number="01" title="Business Snapshot" description="Let us start with the basics about your business." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q01">Business name</Label>
                    <Input id="q01" value={str('q01_business_name')} onChange={e => set('q01_business_name', e.target.value)} maxLength={200} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q02">Your name *</Label>
                    <Input id="q02" value={str('q02_client_name')} onChange={e => set('q02_client_name', e.target.value)} required maxLength={200} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q03">Email address *</Label>
                    <Input id="q03" type="email" value={str('q03_email')} onChange={e => set('q03_email', e.target.value)} required maxLength={320} autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q04">City and state</Label>
                    <Input id="q04" value={str('q04_city_state')} onChange={e => set('q04_city_state', e.target.value)} maxLength={200} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q05">Type of service you provide</Label>
                    <Input id="q05" value={str('q05_service_type')} onChange={e => set('q05_service_type', e.target.value)} maxLength={200} placeholder="e.g. Hair stylist, Esthetician, Coach, Personal trainer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q06">How long have you been in business?</Label>
                    <select id="q06" title="How long have you been in business?" value={str('q06_years_in_business')} onChange={e => set('q06_years_in_business', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                      <option value="">Select...</option>
                      <option value="under_1yr">Under 1 year</option>
                      <option value="1_3yr">1 to 3 years</option>
                      <option value="3_7yr">3 to 7 years</option>
                      <option value="7plus">7+ years</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q07_q08">What services do you offer, and which make you the most money?</Label>
                    <Textarea id="q07_q08" value={str('q07_q08_services')} onChange={e => set('q07_q08_services', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. I mostly do balayage, cuts, and color corrections. Color corrections and extensions are my biggest earners." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q08b">When someone asks what you do, what do you usually say?</Label>
                    <Textarea id="q08b" value={str('q08b_elevator_pitch')} onChange={e => set('q08b_elevator_pitch', e.target.value)} rows={3} maxLength={1000}
                      placeholder="No need to have it perfect -- just how you would actually say it" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q08c">What made you start this business -- and what keeps you going?</Label>
                    <Textarea id="q08c" value={str('q08c_passion_purpose')} onChange={e => set('q08c_passion_purpose', e.target.value)} rows={3} maxLength={2000}
                      placeholder="The reason you got into this -- and what keeps you going" />
                  </div>
                </div>

                <SectionDivider title="Online Presence" note="Sharing these lets me start reviewing your current visibility right away." />
                <div className="space-y-4">
                  <IntakeLinkTable
                    title="Business links"
                    rows={[
                      { label: 'Website', fieldKey: 'links_website', placeholder: 'https://...' },
                      { label: 'Google My Business', fieldKey: 'links_gmb', placeholder: 'https://...' },
                      { label: 'Booking link', fieldKey: 'links_booking', placeholder: 'https://...' },
                      { label: 'Yelp', fieldKey: 'links_yelp', placeholder: 'https://...' },
                      { label: 'Other', fieldKey: 'links_other', placeholder: 'https://...' },
                    ]}
                    values={{
                      links_website: str('links_website'),
                      links_gmb: str('links_gmb'),
                      links_booking: str('links_booking'),
                      links_yelp: str('links_yelp'),
                      links_other: str('links_other'),
                    }}
                    onChange={handleLinkChange}
                  />
                  <IntakeLinkTable
                    title="Social media links"
                    rows={[
                      { label: 'Instagram', fieldKey: 'socials_instagram', placeholder: 'https://instagram.com/...' },
                      { label: 'Facebook', fieldKey: 'socials_facebook', placeholder: 'https://facebook.com/...' },
                      { label: 'TikTok', fieldKey: 'socials_tiktok', placeholder: 'https://tiktok.com/@...' },
                      { label: 'Other', fieldKey: 'socials_other1', placeholder: 'https://...' },
                      { label: 'Other', fieldKey: 'socials_other2', placeholder: 'https://...' },
                    ]}
                    values={{
                      socials_instagram: str('socials_instagram'),
                      socials_facebook: str('socials_facebook'),
                      socials_tiktok: str('socials_tiktok'),
                      socials_other1: str('socials_other1'),
                      socials_other2: str('socials_other2'),
                    }}
                    onChange={handleLinkChange}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Capacity + Confirmation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <SectionHeader number="02" title="Where You Are Now" description="Helps design a strategy that fits your real life." />
                <div className="space-y-4">
                  <IntakeConfirmationCard
                    items={[
                      { label: 'Business stage', value: getStageLabel(), formField: 'q11_current_stage' },
                      { label: 'Top priority', value: getGoalLabel(), formField: 'q12_primary_goal' },
                      { label: 'Marketing approach', value: getApproachLabel(), formField: 'q21_marketing_approach' },
                      { label: 'Biggest constraints', value: getConstraintsLabel(), formField: 'q39_biggest_constraints' },
                    ]}
                    onChangeItem={handleConfirmationChange}
                  />
                  <p id="concierge-change-note" className="text-xs text-warm-500">
                    To change these answers, go back to the concierge and start again.
                  </p>

                  <RadioGroup name="q09" label="How full is your schedule right now?" required value={str('q09_schedule_fullness')}
                    onChange={v => set('q09_schedule_fullness', v)}
                    options={[
                      { value: 'under_25', label: 'Under 25% -- I have a lot of open time' },
                      { value: '25_50', label: '25 to 50% -- I have room but it is not consistent' },
                      { value: '50_75', label: '50 to 75% -- Fairly steady but I want more' },
                      { value: '75_100', label: '75 to 100% -- Mostly full or completely booked' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q10">How many more clients could you respectfully add?</Label>
                    <Input id="q10" value={str('q10_capacity_to_add')} onChange={e => set('q10_capacity_to_add', e.target.value)} maxLength={200}
                      placeholder="Your best estimate -- even a rough number helps" />
                  </div>
                  <RadioGroup name="q13" label="How confident do you feel about marketing your business?" required value={str('q13_marketing_confidence')}
                    onChange={v => set('q13_marketing_confidence', v)}
                    options={[
                      { value: 'not_at_all', label: 'Not at all -- I genuinely do not know where to start' },
                      { value: 'a_little_shaky', label: 'A little shaky -- I try things but I am never sure if they are working' },
                      { value: 'middle', label: 'Somewhere in the middle -- I know some things work but I can not stay consistent' },
                      { value: 'fairly_confident', label: 'Fairly confident -- I have a sense of what works, I just need a better system' },
                      { value: 'very_confident', label: 'Very confident -- I know what to do, I just need help executing or scaling' },
                    ]} />
                </div>
              </div>
            )}

            {/* STEP 2: Ideal Clients + Client Flow */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <SectionHeader number="03" title="Your Ideal Clients" description="Think about the clients you love working with." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q14">Your favorite client -- the one you wish you had 10 more of. What makes them great?</Label>
                    <Textarea id="q14" value={str('q14_ideal_client')} onChange={e => set('q14_ideal_client', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. They trust my recommendations, show up on time, rebook regularly, and refer friends." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q15">What type of clients do you prefer NOT to work with?</Label>
                    <HelperText>Knowing who drains your energy is just as important as knowing who lights you up.</HelperText>
                    <Textarea id="q15" value={str('q15_clients_to_avoid')} onChange={e => set('q15_clients_to_avoid', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. Price shoppers, people who cancel last minute" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q16">What problems do people typically hire you to solve?</Label>
                    <Textarea id="q16" value={str('q16_problems_solved')} onChange={e => set('q16_problems_solved', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. They want to look put-together without spending hours on styling" />
                  </div>
                </div>

                <SectionDivider title="Current Client Flow" />
                <div className="space-y-4">
                  <CheckboxGroup label="Where do most of your clients come from? (check all that apply)" required
                    value={checkboxFields.q17_client_sources}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q17_client_sources: v }))}
                    options={[
                      { value: 'referrals', label: 'Referrals from existing clients' },
                      { value: 'repeat', label: 'Repeat/returning clients' },
                      { value: 'social_media', label: 'Social media (Instagram, Facebook, TikTok, etc.)' },
                      { value: 'google', label: 'Google search / Google Maps' },
                      { value: 'walk_ins', label: 'Walk-ins' },
                      { value: 'paid_ads', label: 'Paid ads (Facebook ads, Google ads, etc.)' },
                      { value: 'community', label: 'Community events or networking' },
                      { value: 'directories', label: 'Online directories (Yelp, Booksy, StyleSeat, etc.)' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q19">What has worked best for bringing in clients?</Label>
                    <Textarea id="q19" value={str('q19_what_works')} onChange={e => set('q19_what_works', e.target.value)} rows={3} maxLength={2000} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q19b">What do your returning clients say they love about working with you?</Label>
                    <Textarea id="q19b" value={str('q19b_why_clients_return')} onChange={e => set('q19b_why_clients_return', e.target.value)} rows={3} maxLength={2000}
                      placeholder="In their words, not yours" />
                  </div>
                  <RadioGroup name="q19c" label="Do you have a system for rebooking or following up with past clients?" required
                    value={str('q19c_rebooking_system')}
                    onChange={v => set('q19c_rebooking_system', v)}
                    options={[
                      { value: 'yes_process', label: 'Yes, I have a process' },
                      { value: 'sort_of', label: 'Sort of, but it is not consistent' },
                      { value: 'no_followup', label: 'No, I do not follow up' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q20">What have you tried that did NOT work?</Label>
                    <Textarea id="q20" value={str('q20_what_didnt_work')} onChange={e => set('q20_what_didnt_work', e.target.value)} rows={3} maxLength={2000} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Marketing Reality + Social Media */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <SectionHeader number="04" title="Marketing Reality" description="No judgment -- most service providers were never taught this stuff." />
                <div className="space-y-4">
                  <CheckboxGroup label="When you think about marketing, what comes up? (check all that apply)" required
                    value={checkboxFields.q22_q23_marketing_feelings}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q22_q23_marketing_feelings: v }))}
                    helperText="No wrong answers. This helps me understand where you are mentally, not just tactically."
                    options={[
                      { value: 'excited', label: 'Excited -- I want to learn' },
                      { value: 'overwhelmed', label: 'Overwhelmed -- too much to figure out' },
                      { value: 'confused', label: 'Confused -- I do not know what works' },
                      { value: 'resistant', label: 'Resistant -- I just want to do my craft' },
                      { value: 'exhausted', label: 'Exhausted -- I have tried and I am tired' },
                      { value: 'unsure_start', label: 'Unsure where to start' },
                      { value: 'focused_redirect', label: 'Focused but need a redirect' },
                      { value: 'struggling_time', label: 'Struggling to find time' },
                      { value: 'posting_no_results', label: 'Posting but not seeing results' },
                      { value: 'not_sure_working', label: 'Not sure what is actually working' },
                      { value: 'raise_prices_afraid', label: 'Want to raise prices but afraid to' },
                      { value: 'wrong_clients', label: 'Attracting the wrong clients' },
                    ]} />
                </div>

                <SectionDivider title="Social Media and Visibility" />
                <div className="space-y-4">
                  <RadioGroup name="q24" label="Are you currently active on social media for your business?" required
                    value={str('q24_social_active')}
                    onChange={v => set('q24_social_active', v)}
                    options={[
                      { value: 'yes', label: 'Yes -- I post regularly' },
                      { value: 'sometimes', label: 'Sometimes -- I post when I remember or feel motivated' },
                      { value: 'rarely_never', label: 'Rarely or never' },
                    ]} />

                  {showActivePosters && (
                    <div className="space-y-4 pl-4 border-l-2 border-brand-200">
                      <CheckboxGroup label="Which platforms do you use?" required
                        value={checkboxFields.q25_platforms_used}
                        onChange={v => setCheckboxFields(prev => ({ ...prev, q25_platforms_used: v }))}
                        options={[
                          { value: 'instagram', label: 'Instagram' },
                          { value: 'facebook', label: 'Facebook' },
                          { value: 'tiktok', label: 'TikTok' },
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'pinterest', label: 'Pinterest' },
                          { value: 'google_business', label: 'Google Business Profile' },
                        ]} />
                      <div className="space-y-1.5">
                        <Label htmlFor="q27">What type of content performs best?</Label>
                        <Input id="q27" value={str('q27_best_content')} onChange={e => set('q27_best_content', e.target.value)} maxLength={500}
                          placeholder="e.g. Before and afters, Reels, Stories" />
                      </div>
                    </div>
                  )}

                  {showNonPosters && (
                    <div className="space-y-4 pl-4 border-l-2 border-brand-200">
                      <CheckboxGroup label="What has stopped you from being more active?" required
                        value={checkboxFields.q28_stopped_reason}
                        onChange={v => setCheckboxFields(prev => ({ ...prev, q28_stopped_reason: v }))}
                        options={[
                          { value: 'no_time', label: 'I do not have time' },
                          { value: 'anxious', label: 'It makes me anxious or uncomfortable' },
                          { value: 'not_sure_what', label: 'I am not sure what to post' },
                          { value: 'doesnt_work', label: 'It does not seem to work for me' },
                          { value: 'not_interested', label: 'I am not interested in social media' },
                        ]} />
                      <RadioGroup name="q29" label="If you could only do ONE visibility activity per week, which would you tolerate most?" required
                        value={str('q29_tolerable_activity')}
                        onChange={v => set('q29_tolerable_activity', v)}
                        options={[
                          { value: 'post_social', label: 'Post one thing on social media' },
                          { value: 'share_story', label: 'Share one Instagram/Facebook story' },
                          { value: 'ask_review', label: 'Ask a client for a review' },
                          { value: 'reach_past_client', label: 'Reach out to a past client' },
                          { value: 'send_text_email', label: 'Send a text or email to existing clients' },
                          { value: 'community_event', label: 'Attend or participate in a local community event' },
                        ]} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Offers, Goals, Voice */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <SectionHeader number="05" title="Offers and Pricing" description="Helps understand what you want to sell more of and whether pricing supports your goals." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q30_q31">What services do you want to focus on -- and what would you love to phase out?</Label>
                    <Textarea id="q30_q31" value={str('q30_q31_service_focus')} onChange={e => set('q30_q31_service_focus', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. I want more balayage clients and fewer basic cuts. I would love to phase out kids haircuts entirely." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q32_q33">What is your average service price and your highest?</Label>
                    <Input id="q32_q33" value={str('q32_q33_pricing')} onChange={e => set('q32_q33_pricing', e.target.value)} maxLength={200}
                      placeholder="e.g. Average $85, highest is $350 color correction" />
                  </div>
                  <RadioGroup name="q34" label="Do cancellations, no-shows, or scope creep impact your income?" required
                    value={str('q34_cancellation_impact')}
                    onChange={v => set('q34_cancellation_impact', v)}
                    options={[
                      { value: 'not_really', label: 'Not really -- it is rare' },
                      { value: 'sometimes', label: 'Sometimes -- it happens enough to notice' },
                      { value: 'frequently', label: 'Frequently -- it is a real problem' },
                    ]} />
                </div>

                <SectionDivider title="Tools and Technology" />
                <div className="space-y-4">
                  <RadioGroup name="q35_q36" label="How would you describe your comfort with technology?" required value={str('q35_q36_tech_comfort')}
                    onChange={v => set('q35_q36_tech_comfort', v)}
                    options={[
                      { value: 'avoid_tech', label: 'I avoid technology when I can' },
                      { value: 'social_not_strategic', label: 'I use social media but not strategically' },
                      { value: 'comfortable_posting', label: 'I am comfortable posting but not with marketing tools' },
                      { value: 'like_learning', label: 'I like learning new tools and platforms' },
                      { value: 'excited_ai', label: 'I am excited about AI and automation and already use AI tools' },
                    ]} />

                  {showAiFrequency && (
                    <div className="pl-4 border-l-2 border-brand-200">
                      <RadioGroup name="q36b" label="How often do you use AI tools?" value={str('q36b_ai_frequency')}
                        onChange={v => set('q36b_ai_frequency', v)}
                        options={[
                          { value: 'never', label: 'Never -- I have not tried them' },
                          { value: 'occasionally', label: 'Occasionally -- I have played around with them' },
                          { value: 'weekly', label: 'Weekly -- I use them somewhat regularly' },
                          { value: 'daily', label: 'Daily -- they are part of my routine' },
                        ]} />
                    </div>
                  )}

                  <CheckboxGroup label="What would you most like help with? (check all that apply)" required
                    value={checkboxFields.q37_help_wanted}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q37_help_wanted: v }))}
                    options={[
                      { value: 'content_ideas', label: 'Coming up with ideas for content' },
                      { value: 'writing', label: 'Writing captions, posts, or messages' },
                      { value: 'marketing_plan', label: 'Building a marketing plan or system' },
                      { value: 'offers_pricing', label: 'Figuring out my offers and pricing' },
                      { value: 'saving_time', label: 'Saving time on repetitive tasks' },
                      { value: 'automations', label: 'Setting up simple automations' },
                    ]} />
                </div>

                <SectionDivider title="Goals and Constraints" />
                <div className="space-y-4">
                  <RadioGroup name="q38" label="How much time can you spend on marketing each week?" required value={str('q38_time_for_marketing')}
                    onChange={v => set('q38_time_for_marketing', v)}
                    options={[
                      { value: 'none', label: 'None right now -- I am at full capacity' },
                      { value: 'under_30min', label: 'Under 30 minutes' },
                      { value: '30_60min', label: '30 to 60 minutes' },
                      { value: '1_2hrs', label: '1 to 2 hours' },
                      { value: '2plus_hrs', label: '2+ hours' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q40">What would success look like 90 days from now?</Label>
                    <Textarea id="q40" value={str('q40_success_90_days')} onChange={e => set('q40_success_90_days', e.target.value)} rows={3} maxLength={2000}
                      placeholder="Dream a little here. What would feel different?" />
                  </div>
                </div>

                <SectionDivider title="Your Voice and Rhythm" note="These help me build AI content prompts that actually sound like you -- and a system you will stick with." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q40b">How would you describe your personality and voice? *</Label>
                    <Textarea id="q40b" value={str('q40b_voice_personality')} onChange={e => set('q40b_voice_personality', e.target.value)} rows={3} maxLength={2000} required
                      placeholder="e.g. Warm and direct, a little funny, no-nonsense but caring" />
                  </div>
                  <CheckboxGroup label="What types of content do you actually enjoy creating? (check all that apply)"
                    value={checkboxFields.q40c_content_enjoyment}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q40c_content_enjoyment: v }))}
                    options={[
                      { value: 'before_after_photos', label: 'Before and after photos' },
                      { value: 'short_videos', label: 'Short videos or Reels' },
                      { value: 'behind_scenes', label: 'Behind the scenes content' },
                      { value: 'writing_captions', label: 'Writing captions or posts' },
                      { value: 'educational_tips', label: 'Educational tips and how-tos' },
                      { value: 'testimonials', label: 'Sharing client testimonials' },
                      { value: 'personal_stories', label: 'Personal stories' },
                      { value: 'no_content_enjoyment', label: 'Honestly, none of it' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q40d">What are the top 2-3 questions clients ask before booking? *</Label>
                    <Textarea id="q40d" value={str('q40d_client_faqs')} onChange={e => set('q40d_client_faqs', e.target.value)} rows={3} maxLength={2000} required
                      placeholder="e.g. How much does a balayage cost? Do you work with curly hair? How long will it take?" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q40e">How do your clients feel after working with you?</Label>
                    <Textarea id="q40e" value={str('q40e_client_transformation')} onChange={e => set('q40e_client_transformation', e.target.value)} rows={3} maxLength={2000}
                      placeholder='e.g. They always say "I feel like myself again" or "Why did I wait so long?"' />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q40f">Anything big happening in the next 3 months?</Label>
                    <Textarea id="q40f" value={str('q40f_seasonality')} onChange={e => set('q40f_seasonality', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. Launching a new service, raising prices, moving locations, busy holiday season" />
                  </div>
                  <RadioGroup name="q40g" label="Do you run your business solo or with help?" value={str('q40g_solo_or_team')}
                    onChange={v => set('q40g_solo_or_team', v)}
                    options={[
                      { value: 'completely_solo', label: 'Completely solo -- it is just me' },
                      { value: 'mostly_solo', label: 'Mostly solo with occasional help' },
                      { value: 'small_team', label: 'Small team (1-3 people)' },
                      { value: 'established_team', label: 'Established team (4+ people)' },
                    ]} />
                </div>

                <SectionDivider title="Anything Else" />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q47">Anything else important about your business, goals, or situation?</Label>
                    <Textarea id="q47" value={str('q47_anything_else')} onChange={e => set('q47_anything_else', e.target.value)} rows={4} maxLength={5000}
                      placeholder="Personal constraints, upcoming changes, concerns, hopes -- anything." />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Consent */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <SectionHeader number="06" title="You Made It" description="You are almost there." />
                <div className="space-y-4">
                  <p className="text-sm text-warm-800">
                    By submitting, you are giving me permission to review your answers and prepare a personalized strategy session just for you. Everything you shared stays between us -- this is your reset, and I am here to help you make it count.
                  </p>
                  <div className="rounded-lg bg-white p-4 border border-brand-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => setConsent(e.target.checked)}
                        className="mt-0.5 accent-brand-600"
                        required
                      />
                      <span className="text-sm text-warm-900">
                        I understand that this marketing reset provides clarity, a personalized system, and practical tools -- but results depend on my consistent implementation. This is not ongoing marketing management, and no specific outcomes are guaranteed. *
                      </span>
                    </label>
                  </div>
                </div>

                {formState.status === 'error' && (
                  <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formState.message}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <IntakeStepNav
          currentStep={currentStep}
          isSubmitting={formState.status === 'submitting'}
          onBack={goBack}
          onNext={goNext}
        />
      </form>
    </div>
  );
}
