import { z } from 'zod';

// === CLIENT VALIDATION ===

export const quickAddClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email required').max(320),
  businessName: z.string().max(200).optional(),
  serviceType: z.string().max(100).optional(),
});

export const fullIntakeSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  intakeData: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export const stageTransitionSchema = z.object({
  newStage: z.enum([
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
  ]),
});

export const fitAssessmentActionSchema = z.object({
  action: z.enum(['accept', 'decline']),
  note: z.string().max(1000).optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000),
  noteType: z.enum(['general', 'interest_flag', 'analysis_note', 'session_note']).default('general'),
});

export const deliverableUpdateSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'generated', 'sent']).optional(),
  content: z.string().max(50000).optional(),
  notes: z.string().max(5000).optional(),
});

// === CONTACT FORM (public site) ===

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email required').max(320),
  businessName: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

// === PUBLIC INTAKE FORM ===

export const publicIntakeSchema = z.object({
  // Step 1: About You
  q01_business_name: z.string().max(200).optional(),
  q02_client_name: z.string().min(1, 'Name is required').max(200),
  q03_email: z.string().email('Valid email required').max(320),
  q04_city_state: z.string().max(200).optional(),
  q05_service_type: z.string().max(200).optional(),
  q06_years_in_business: z.string().max(50).optional(),

  // Step 2: Your Services
  q07_q08_services: z.string().max(2000).optional(),           // "What services do you offer, and which make you the most money?"
  q08b_elevator_pitch: z.string().max(1000).optional(),
  q08c_passion_purpose: z.string().max(2000).optional(),       // "What made you start this business?"

  // Step 3: Capacity & Stage
  q09_schedule_fullness: z.string().max(50).optional(),
  q10_capacity_to_add: z.string().max(200).optional(),         // "How many more clients could you respectfully add?"
  q11_current_stage: z.string().max(500).optional(),
  q11_current_stage_other: z.string().max(500).optional(),

  // Step 4: Goals
  q12_primary_goal: z.string().max(100).optional(),
  q13_marketing_confidence: z.number().int().min(1).max(5).optional(),

  // Step 5: Ideal Client
  q14_ideal_client: z.string().max(2000).optional(),
  q15_clients_to_avoid: z.string().max(2000).optional(),
  q16_problems_solved: z.string().max(2000).optional(),

  // Step 6: Client Sources & Retention
  q17_client_sources: z.array(z.string().max(200)).optional(),
  q19_what_works: z.string().max(2000).optional(),
  q19b_why_clients_return: z.string().max(2000).optional(),
  q19c_rebooking_system: z.string().max(100).optional(),

  // Step 7: What Hasn't Worked
  q20_what_didnt_work: z.string().max(2000).optional(),
  q21_marketing_approach: z.string().max(100).optional(),
  q22_q23_marketing_feelings: z.array(z.string().max(200)).optional(), // Combined marketing feelings + hardest now

  // Step 8: Social Media
  q24_social_active: z.string().max(50).optional(),
  q25_platforms_used: z.array(z.string().max(100)).optional(),
  q27_best_content: z.string().max(500).optional(),
  q28_stopped_reason: z.array(z.string().max(200)).optional(),
  q29_tolerable_activity: z.string().max(100).optional(),

  // Step 9: Services & Pricing
  q30_q31_service_focus: z.string().max(2000).optional(),      // "What to focus on, what to phase out?"
  q32_q33_pricing: z.string().max(200).optional(),             // "Average and highest price"
  q34_no_shows_impact: z.string().max(50).optional(),

  // Step 10: Tech & Capacity
  q35_q36_tech_comfort: z.string().max(200).optional(),        // Combined tech + AI comfort
  q36b_ai_frequency: z.string().max(200).optional(),           // Conditional AI usage frequency
  q37_help_wanted: z.array(z.string().max(200)).optional(),
  q38_time_for_marketing: z.string().max(50).optional(),
  q39_biggest_constraints: z.array(z.string().max(200)).optional(), // was singular string

  // Step 11: Vision & Voice
  q40_success_90_days: z.string().max(2000).optional(),
  q40b_voice_personality: z.string().max(2000).optional(),     // "How would your best friend describe..."
  q40c_content_enjoyment: z.array(z.string().max(200)).optional(), // Content types they enjoy
  q40d_client_faqs: z.string().max(2000).optional(),           // "Top 2-3 questions before booking"
  q40e_client_transformation: z.string().max(2000).optional(), // "How do clients feel after?"
  q40f_seasonality: z.string().max(2000).optional(),           // "Anything big in next 3 months?"
  q40g_solo_or_team: z.string().max(200).optional(),           // "Solo or have help?"

  // Step 12: Links (replacing q41-q44)
  links_website: z.string().max(500).optional(),
  links_gmb: z.string().max(500).optional(),
  links_booking: z.string().max(500).optional(),
  links_yelp: z.string().max(500).optional(),
  links_other: z.string().max(500).optional(),
  socials_instagram: z.string().max(500).optional(),
  socials_facebook: z.string().max(500).optional(),
  socials_tiktok: z.string().max(500).optional(),
  socials_other1: z.string().max(500).optional(),
  socials_other2: z.string().max(500).optional(),

  // Step 13: Final
  q47_anything_else: z.string().max(5000).optional(),
  q48_consent: z.literal(true, { error: 'You must agree to continue' }),
});

// === AUTH ===

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// === TYPE EXPORTS ===

export type QuickAddClientInput = z.infer<typeof quickAddClientSchema>;
export type FullIntakeInput = z.infer<typeof fullIntakeSchema>;
export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;
export type FitAssessmentAction = z.infer<typeof fitAssessmentActionSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type DeliverableUpdate = z.infer<typeof deliverableUpdateSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PublicIntakeInput = z.infer<typeof publicIntakeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
