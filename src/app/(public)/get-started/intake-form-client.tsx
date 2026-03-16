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

function SectionHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="pt-10 pb-4 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-brand-200">
          {number}
        </span>
        <h2 className="text-xl font-bold text-brand-800 dark:text-brand-100">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-warm-800 dark:text-warm-300">{description}</p>
      <div className="mt-4 h-px bg-brand-200 dark:bg-brand-700" />
    </div>
  );
}

function RadioGroup({
  name, label, options, value, onChange, required = false,
}: {
  name: string; label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-brand-800 dark:text-brand-100">
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
            <span className="text-sm text-warm-900 dark:text-warm-200">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  label, options, value, onChange, required = false,
}: {
  label: string; options: string[];
  value: string[]; onChange: (v: string[]) => void; required?: boolean;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-brand-800 dark:text-brand-100">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="mt-0.5 accent-brand-600"
            />
            <span className="text-sm text-warm-900 dark:text-warm-200">{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ScaleInput({
  label, value, onChange,
}: {
  label: string; value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-brand-800 dark:text-brand-100">
        {label}<span className="text-red-500 ml-0.5">*</span>
      </legend>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-warm-900 dark:text-warm-300">Not confident</span>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              value === n
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-600 hover:bg-brand-100 dark:hover:bg-brand-700 text-brand-700 dark:text-brand-200'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-warm-900 dark:text-warm-300">Very confident</span>
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
  q22_marketing_feelings: [],
  q23_hardest_now: [],
  q25_platforms_used: [],
  q28_stopped_reason: [],
  q37_help_wanted: [],
  q45_proof_assets: [],
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
    const q11 = searchParams.get('q11');
    const q12 = searchParams.get('q12');
    const q21 = searchParams.get('q21');
    const q39 = searchParams.get('q39');
    if (q11) prefills.q11_current_stage = q11;
    if (q12) prefills.q12_primary_goal = q12;
    if (q21) prefills.q21_marketing_approach = q21;
    if (q39) prefills.q39_biggest_constraint = q39;

    return {
      form: { ...(draft?.form ?? {}), ...prefills },
      checkboxFields: { ...defaultCheckboxFields, ...(draft?.checkboxFields ?? {}) },
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
  function num(key: string): number | null {
    return (form[key] as number) ?? null;
  }

  const socialActive = str('q24_social_active');
  const showActivePosters = socialActive === 'yes' || socialActive === 'sometimes';
  const showNonPosters = socialActive === 'rarely_never';

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

  if (formState.status === 'success') {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 dark:bg-sage-900">
          <Send className="h-7 w-7 text-sage-600 dark:text-sage-300" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-brand-800 dark:text-brand-100">Intake received.</h2>
        <p className="mt-3 text-warm-800 dark:text-warm-300 max-w-md mx-auto">
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
            {/* STEP 0: Business Snapshot (q01-q08, q08b) */}
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
                    <Input id="q05" value={str('q05_service_type')} onChange={e => set('q05_service_type', e.target.value)} maxLength={200} placeholder="e.g. Hair stylist, Esthetician, Coach" />
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
                    <Label htmlFor="q07">Services you provide most often</Label>
                    <Input id="q07" value={str('q07_services_most_often')} onChange={e => set('q07_services_most_often', e.target.value)} maxLength={500} placeholder="e.g. Balayage, cuts, color corrections" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q08">Your most profitable services</Label>
                    <Input id="q08" value={str('q08_most_profitable')} onChange={e => set('q08_most_profitable', e.target.value)} maxLength={500} placeholder="e.g. Color corrections and extensions" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q08b">When someone asks what you do, what do you usually say?</Label>
                    <Textarea id="q08b" value={str('q08b_elevator_pitch')} onChange={e => set('q08b_elevator_pitch', e.target.value)} rows={3} maxLength={1000}
                      placeholder="In your own words, not a rehearsed pitch" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Capacity, Workload & Stage (q09-q13) */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <SectionHeader number="02" title="Capacity, Workload and Stage" description="Helps design a strategy that fits your real life." />
                <div className="space-y-4">
                  <RadioGroup name="q09" label="How full is your schedule right now?" required value={str('q09_schedule_fullness')}
                    onChange={v => set('q09_schedule_fullness', v)}
                    options={[
                      { value: 'under_25', label: 'Under 25% -- I have a lot of open time' },
                      { value: '25_50', label: '25 to 50% -- I have room but it is not consistent' },
                      { value: '50_75', label: '50 to 75% -- Fairly steady but I want more' },
                      { value: '75_100', label: '75 to 100% -- Mostly full or completely booked' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q10">How many clients can you handle per week?</Label>
                    <Input id="q10" value={str('q10_clients_per_week')} onChange={e => set('q10_clients_per_week', e.target.value)} maxLength={100} placeholder="Your best estimate" />
                  </div>
                  <RadioGroup name="q11" label="Which best describes where you are right now?" required value={str('q11_current_stage')}
                    onChange={v => set('q11_current_stage', v)}
                    options={[
                      { value: 'just_starting', label: 'Just starting out -- building from scratch' },
                      { value: 'inconsistent', label: 'Established but inconsistent -- some good weeks, some slow ones' },
                      { value: 'fully_booked', label: 'Fully booked but want better-fit clients or higher pricing' },
                      { value: 'overwhelmed', label: 'Overwhelmed or burned out -- need to simplify' },
                      { value: 'stagnant', label: 'Stagnant or plateaued -- stuck and not sure what is next' },
                    ]} />
                  <RadioGroup name="q12" label="Primary goal right now?" required value={str('q12_primary_goal')}
                    onChange={v => set('q12_primary_goal', v)}
                    options={[
                      { value: 'more_clients', label: 'I need more clients' },
                      { value: 'consistent_bookings', label: 'I need more consistent bookings' },
                      { value: 'better_fit', label: 'I want better-fit clients' },
                      { value: 'increase_pricing', label: 'I want to increase my pricing' },
                      { value: 'reduce_workload', label: 'I need to reduce my workload and avoid burnout' },
                    ]} />
                  <ScaleInput label="How confident do you feel about marketing your business?"
                    value={num('q13_marketing_confidence')} onChange={v => set('q13_marketing_confidence', v)} />
                </div>
              </div>
            )}

            {/* STEP 2: Your Clients + Client Flow (q14-q20, q19b, q19c, q20b, q20c) */}
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
                    <Textarea id="q15" value={str('q15_clients_to_avoid')} onChange={e => set('q15_clients_to_avoid', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. Price shoppers, people who cancel last minute" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q16">What problems do people typically hire you to solve?</Label>
                    <Textarea id="q16" value={str('q16_problems_solved')} onChange={e => set('q16_problems_solved', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. They want to look put-together without spending hours on styling" />
                  </div>
                </div>

                <SectionHeader number="04" title="Current Client Flow" description="Understanding where your clients come from helps find gaps and opportunities." />
                <div className="space-y-4">
                  <CheckboxGroup label="Where do most of your clients come from? (check all that apply)" required
                    value={checkboxFields.q17_client_sources}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q17_client_sources: v }))}
                    options={[
                      'Referrals from existing clients', 'Repeat/returning clients',
                      'Social media (Instagram, Facebook, TikTok, etc.)', 'Google search / Google Maps',
                      'Walk-ins', 'Paid ads (Facebook ads, Google ads, etc.)',
                      'Community events or networking', 'Online directories (Yelp, Booksy, StyleSeat, etc.)',
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q18">Roughly how many new clients do you get per month?</Label>
                    <select id="q18" title="Roughly how many new clients do you get per month?" value={str('q18_new_clients_month')} onChange={e => set('q18_new_clients_month', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                      <option value="">Select...</option>
                      <option value="0_2">0 to 2</option>
                      <option value="3_5">3 to 5</option>
                      <option value="6_10">6 to 10</option>
                      <option value="11_20">11 to 20</option>
                      <option value="20plus">20+</option>
                    </select>
                  </div>
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
                  <div className="space-y-1.5">
                    <Label htmlFor="q20b">Who else serves similar clients in your area or niche? (optional)</Label>
                    <Textarea id="q20b" value={str('q20b_competitors')} onChange={e => set('q20b_competitors', e.target.value)} rows={2} maxLength={1000}
                      placeholder="Names, businesses, or general descriptions" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q20c">What do they seem to do well with their marketing? (optional)</Label>
                    <Textarea id="q20c" value={str('q20c_competitor_strengths')} onChange={e => set('q20c_competitor_strengths', e.target.value)} rows={2} maxLength={1000}
                      placeholder="What have you noticed that works for them?" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Marketing Reality (q20d, q21-q29) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <SectionHeader number="05" title="Marketing Reality" description="No judgment -- most service providers were never taught this stuff." />
                <div className="space-y-4">
                  <RadioGroup name="q21" label="How would you describe your current marketing approach?" required value={str('q21_marketing_approach')}
                    onChange={v => set('q21_marketing_approach', v)}
                    options={[
                      { value: 'no_marketing', label: 'I do not really market -- clients find me through word of mouth' },
                      { value: 'occasional', label: 'I post occasionally but not consistently' },
                      { value: 'regular_no_results', label: 'I post regularly but I am not seeing results' },
                      { value: 'referrals_only', label: 'I rely almost entirely on referrals and repeat clients' },
                      { value: 'tried_unclear', label: 'I have tried different things but nothing feels clear' },
                      { value: 'overwhelmed', label: 'I feel overwhelmed and do not know where to start' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q20d">Have you invested in any paid marketing, coaching, or branding? If so, roughly how much and what happened? (optional)</Label>
                    <Textarea id="q20d" value={str('q20d_marketing_investment')} onChange={e => set('q20d_marketing_investment', e.target.value)} rows={3} maxLength={2000}
                      placeholder="e.g. I spent $500 on Facebook ads but did not see any new clients" />
                  </div>
                  <CheckboxGroup label="When you think about marketing, you feel: (check all that apply)" required
                    value={checkboxFields.q22_marketing_feelings}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q22_marketing_feelings: v }))}
                    options={[
                      'Excited -- I want to learn', 'Overwhelmed -- too much to figure out',
                      'Confused -- I do not know what works', 'Resistant -- I just want to do my craft',
                      'Exhausted -- I have tried and I am tired', 'Unsure where to start',
                    ]} />
                  <CheckboxGroup label="What feels hardest right now? (check all that apply)" required
                    value={checkboxFields.q23_hardest_now}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q23_hardest_now: v }))}
                    options={[
                      'Knowing what to post or say', 'Finding time for marketing',
                      'Understanding social media and what works', 'Getting new clients consistently',
                      'Raising prices without losing people', 'Staying consistent with anything',
                      'Knowing what is actually working vs. wasting time',
                    ]} />
                </div>

                <SectionHeader number="06" title="Social Media and Visibility" description="Whether you love social media or avoid it -- there is a path forward either way." />
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
                    <div className="space-y-4 pl-4 border-l-2 border-brand-200 dark:border-brand-700">
                      <CheckboxGroup label="Which platforms do you use?" required
                        value={checkboxFields.q25_platforms_used}
                        onChange={v => setCheckboxFields(prev => ({ ...prev, q25_platforms_used: v }))}
                        options={['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Pinterest', 'Google Business Profile']} />
                      <div className="space-y-1.5">
                        <Label htmlFor="q26">How often do you post?</Label>
                        <select id="q26" title="How often do you post?" value={str('q26_post_frequency')} onChange={e => set('q26_post_frequency', e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                          <option value="">Select...</option>
                          <option value="daily">Daily</option>
                          <option value="few_times_week">A few times a week</option>
                          <option value="once_week">Once a week</option>
                          <option value="few_times_month">A few times a month</option>
                          <option value="once_month_less">Once a month or less</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="q27">What type of content performs best?</Label>
                        <Input id="q27" value={str('q27_best_content')} onChange={e => set('q27_best_content', e.target.value)} maxLength={500}
                          placeholder="e.g. Before and afters, Reels, Stories" />
                      </div>
                    </div>
                  )}

                  {showNonPosters && (
                    <div className="space-y-4 pl-4 border-l-2 border-brand-200 dark:border-brand-700">
                      <CheckboxGroup label="What has stopped you from being more active?" required
                        value={checkboxFields.q28_stopped_reason}
                        onChange={v => setCheckboxFields(prev => ({ ...prev, q28_stopped_reason: v }))}
                        options={[
                          'I do not have time', 'It makes me anxious or uncomfortable',
                          'I am not sure what to post', 'It does not seem to work for me',
                          'I am not interested in social media',
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

            {/* STEP 4: Offers, Tools & Goals (q30-q40) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <SectionHeader number="07" title="Offers and Pricing" description="Helps understand what you want to sell more of and whether pricing supports your goals." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q30">What services or packages would you like to sell MORE of?</Label>
                    <Textarea id="q30" value={str('q30_sell_more_of')} onChange={e => set('q30_sell_more_of', e.target.value)} rows={3} maxLength={2000} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q31">What would you like to sell LESS of? (optional)</Label>
                    <Textarea id="q31" value={str('q31_sell_less_of')} onChange={e => set('q31_sell_less_of', e.target.value)} rows={2} maxLength={2000} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q32">Average service price</Label>
                    <Input id="q32" value={str('q32_average_price')} onChange={e => set('q32_average_price', e.target.value)} maxLength={100} placeholder="e.g. $85, $150" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q33">Highest-priced service or package</Label>
                    <Input id="q33" value={str('q33_highest_price')} onChange={e => set('q33_highest_price', e.target.value)} maxLength={100} placeholder="e.g. $350 color correction" />
                  </div>
                  <RadioGroup name="q34" label="Do no-shows or last-minute cancellations impact your income?" required
                    value={str('q34_no_shows_impact')}
                    onChange={v => set('q34_no_shows_impact', v)}
                    options={[
                      { value: 'not_really', label: 'Not really -- it is rare' },
                      { value: 'sometimes', label: 'Sometimes -- it happens enough to notice' },
                      { value: 'frequently', label: 'Frequently -- it is a real problem' },
                    ]} />
                </div>

                <SectionHeader number="08" title="Tools and Technology" description="No wrong answer -- this helps set up a system that works for you." />
                <div className="space-y-4">
                  <RadioGroup name="q35" label="How comfortable are you with technology?" required value={str('q35_tech_comfort')}
                    onChange={v => set('q35_tech_comfort', v)}
                    options={[
                      { value: 'avoid', label: 'I avoid technology when I can' },
                      { value: 'social_only', label: 'I use social media but not strategically' },
                      { value: 'comfortable_posting', label: 'I am comfortable posting but not with marketing tools' },
                      { value: 'likes_learning', label: 'I like learning new tools and platforms' },
                      { value: 'excited_ai', label: 'I am excited about AI and automation' },
                    ]} />
                  <RadioGroup name="q36" label="Do you currently use any AI tools?" required value={str('q36_ai_usage')}
                    onChange={v => set('q36_ai_usage', v)}
                    options={[
                      { value: 'never', label: 'Never -- I have not tried them' },
                      { value: 'occasionally', label: 'Occasionally -- I have played around with them' },
                      { value: 'weekly', label: 'Weekly -- I use them somewhat regularly' },
                      { value: 'daily', label: 'Daily -- they are part of my routine' },
                    ]} />
                  <CheckboxGroup label="What would you most like help with? (check all that apply)" required
                    value={checkboxFields.q37_help_wanted}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q37_help_wanted: v }))}
                    options={[
                      'Coming up with ideas for content', 'Writing captions, posts, or messages',
                      'Building a marketing plan or system', 'Figuring out my offers and pricing',
                      'Saving time on repetitive tasks', 'Setting up simple automations',
                    ]} />
                </div>

                <SectionHeader number="09" title="Goals and Constraints" description="Almost done. This helps build a strategy that fits YOUR life." />
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
                  <RadioGroup name="q39" label="What is your biggest constraint right now?" required value={str('q39_biggest_constraint')}
                    onChange={v => set('q39_biggest_constraint', v)}
                    options={[
                      { value: 'time', label: 'Time -- I am stretched thin' },
                      { value: 'money', label: 'Money -- I can not invest much' },
                      { value: 'confidence', label: 'Confidence -- I do not trust my marketing instincts' },
                      { value: 'consistency', label: 'Consistency -- I start things but do not stick with them' },
                      { value: 'clarity', label: 'Clarity -- I do not know what my brand should be' },
                      { value: 'burnout', label: 'Burnout -- I am running on empty' },
                      { value: 'direction', label: 'Direction -- I do not know what actually works' },
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q40">What would success look like 90 days from now?</Label>
                    <Textarea id="q40" value={str('q40_success_90_days')} onChange={e => set('q40_success_90_days', e.target.value)} rows={3} maxLength={2000}
                      placeholder="Dream a little here. What would feel different?" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Final Details (q41-q48) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <SectionHeader number="10" title="Online Presence" description="Sharing these helps review your current visibility before the session." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q41">Website</Label>
                    <Input id="q41" value={str('q41_website')} onChange={e => set('q41_website', e.target.value)} maxLength={500} placeholder="URL or N/A" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q42">Instagram or primary social link</Label>
                    <Input id="q42" value={str('q42_instagram_link')} onChange={e => set('q42_instagram_link', e.target.value)} maxLength={500} placeholder="Profile URL or N/A" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q43">Other social media links (optional)</Label>
                    <Textarea id="q43" value={str('q43_other_social')} onChange={e => set('q43_other_social', e.target.value)} rows={2} maxLength={1000}
                      placeholder="Facebook, TikTok, YouTube, Google Business, etc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="q44">Booking link</Label>
                    <Input id="q44" value={str('q44_booking_link')} onChange={e => set('q44_booking_link', e.target.value)} maxLength={500} placeholder="Booksy, StyleSeat, Calendly URL or N/A" />
                  </div>
                </div>

                <SectionHeader number="11" title="Trust and Proof" description="Powerful tools for attracting new clients." />
                <div className="space-y-4">
                  <CheckboxGroup label="Do you currently have any of the following?" required
                    value={checkboxFields.q45_proof_assets}
                    onChange={v => setCheckboxFields(prev => ({ ...prev, q45_proof_assets: v }))}
                    options={[
                      'Google reviews', 'Yelp reviews',
                      'Testimonials from clients (written or screenshot)',
                      'Before-and-after photos of your work',
                      'A portfolio or gallery on your website',
                      'Client video testimonials',
                      'Awards, certifications, or press features',
                      'None of the above',
                    ]} />
                  <div className="space-y-1.5">
                    <Label htmlFor="q46">How many Google reviews does your business have?</Label>
                    <select id="q46" title="How many Google reviews does your business have?" value={str('q46_google_reviews')} onChange={e => set('q46_google_reviews', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                      <option value="">Select...</option>
                      <option value="no_profile">I do not have a Google Business profile</option>
                      <option value="0">0</option>
                      <option value="1_10">1 to 10</option>
                      <option value="11_25">11 to 25</option>
                      <option value="25_50">25 to 50</option>
                      <option value="50plus">50+</option>
                    </select>
                  </div>
                </div>

                <SectionHeader number="12" title="Final Thoughts" description="Your space to share anything else." />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="q47">Anything else important about your business, goals, or situation?</Label>
                    <Textarea id="q47" value={str('q47_anything_else')} onChange={e => set('q47_anything_else', e.target.value)} rows={4} maxLength={5000}
                      placeholder="Personal constraints, upcoming changes, concerns, hopes -- anything." />
                  </div>
                  <div className="h-px bg-brand-200 dark:bg-brand-700" />
                  <div className="rounded-lg bg-white dark:bg-brand-900 p-4 border border-brand-200 dark:border-brand-700">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => setConsent(e.target.checked)}
                        className="mt-0.5 accent-brand-600"
                        required
                      />
                      <span className="text-sm text-warm-900 dark:text-warm-200">
                        I understand that this marketing reset provides clarity, a personalized system, and practical tools -- but results depend on my consistent implementation. This is not ongoing marketing management, and no specific outcomes are guaranteed. *
                      </span>
                    </label>
                  </div>
                </div>

                {formState.status === 'error' && (
                  <p role="alert" className="rounded-md bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300">
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
