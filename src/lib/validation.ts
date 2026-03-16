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
  q01_business_name: z.string().max(200).optional(),
  q02_client_name: z.string().min(1, 'Name is required').max(200),
  q03_email: z.string().email('Valid email required').max(320),
  q04_city_state: z.string().max(200).optional(),
  q05_service_type: z.string().max(200).optional(),
  q06_years_in_business: z.string().max(50).optional(),
  q07_services_most_often: z.string().max(500).optional(),
  q08_most_profitable: z.string().max(500).optional(),
  q08b_elevator_pitch: z.string().max(1000).optional(),
  q09_schedule_fullness: z.string().max(50).optional(),
  q10_clients_per_week: z.string().max(100).optional(),
  q11_current_stage: z.string().max(100).optional(),
  q12_primary_goal: z.string().max(100).optional(),
  q13_marketing_confidence: z.number().int().min(1).max(5).optional(),
  q14_ideal_client: z.string().max(2000).optional(),
  q15_clients_to_avoid: z.string().max(2000).optional(),
  q16_problems_solved: z.string().max(2000).optional(),
  q17_client_sources: z.array(z.string().max(200)).optional(),
  q18_new_clients_month: z.string().max(50).optional(),
  q19_what_works: z.string().max(2000).optional(),
  q19b_why_clients_return: z.string().max(2000).optional(),
  q19c_rebooking_system: z.string().max(100).optional(),
  q20_what_didnt_work: z.string().max(2000).optional(),
  q20b_competitors: z.string().max(1000).optional(),
  q20c_competitor_strengths: z.string().max(1000).optional(),
  q21_marketing_approach: z.string().max(100).optional(),
  q20d_marketing_investment: z.string().max(2000).optional(),
  q22_marketing_feelings: z.array(z.string().max(200)).optional(),
  q23_hardest_now: z.array(z.string().max(200)).optional(),
  q24_social_active: z.string().max(50).optional(),
  q25_platforms_used: z.array(z.string().max(100)).optional(),
  q26_post_frequency: z.string().max(50).optional(),
  q27_best_content: z.string().max(500).optional(),
  q28_stopped_reason: z.array(z.string().max(200)).optional(),
  q29_tolerable_activity: z.string().max(100).optional(),
  q30_sell_more_of: z.string().max(2000).optional(),
  q31_sell_less_of: z.string().max(2000).optional(),
  q32_average_price: z.string().max(100).optional(),
  q33_highest_price: z.string().max(100).optional(),
  q34_no_shows_impact: z.string().max(50).optional(),
  q35_tech_comfort: z.string().max(100).optional(),
  q36_ai_usage: z.string().max(100).optional(),
  q37_help_wanted: z.array(z.string().max(200)).optional(),
  q38_time_for_marketing: z.string().max(50).optional(),
  q39_biggest_constraint: z.string().max(100).optional(),
  q40_success_90_days: z.string().max(2000).optional(),
  q41_website: z.string().max(500).optional(),
  q42_instagram_link: z.string().max(500).optional(),
  q43_other_social: z.string().max(1000).optional(),
  q44_booking_link: z.string().max(500).optional(),
  q45_proof_assets: z.array(z.string().max(200)).optional(),
  q46_google_reviews: z.string().max(50).optional(),
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
