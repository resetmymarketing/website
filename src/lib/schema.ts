import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

// === ENUMS ===

export const pipelineStageEnum = pgEnum('pipeline_stage', [
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
]);

export const fitRatingEnum = pgEnum('fit_rating', ['green', 'yellow', 'red']);

export const deliverableStatusEnum = pgEnum('deliverable_status', [
  'not_started',
  'in_progress',
  'generated',
  'sent',
]);

export const noteTypeEnum = pgEnum('note_type', [
  'general',
  'interest_flag',
  'analysis_note',
  'session_note',
]);

export const userRoleEnum = pgEnum('user_role', ['admin', 'viewer']);

// === TABLES ===

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  // Pipeline
  status: pipelineStageEnum('status').notNull().default('inquiry'),
  fitRating: fitRatingEnum('fit_rating'),
  archetype: text('archetype'),
  timeTier: text('time_tier'),

  // Dates
  inquiryDate: timestamp('inquiry_date', { withTimezone: true }),
  intakeDate: timestamp('intake_date', { withTimezone: true }),
  paymentDate: timestamp('payment_date', { withTimezone: true }),
  sessionDate: timestamp('session_date', { withTimezone: true }),
  deliverablesSentDate: timestamp('deliverables_sent_date', { withTimezone: true }),
  followupDate: timestamp('followup_date', { withTimezone: true }),
  followupCompleteDate: timestamp('followup_complete_date', { withTimezone: true }),

  // Financial
  pricePaid: integer('price_paid'),
  pricingTier: text('pricing_tier'),

  // Testimonials & referrals
  testimonialReceived: boolean('testimonial_received').default(false),
  testimonialText: text('testimonial_text'),
  referralSource: text('referral_source'),
  referralsGiven: integer('referrals_given').default(0),

  // Intake answers (q01-q48 stored as JSONB for flexibility)
  intakeData: jsonb('intake_data').$type<Record<string, string | string[]>>(),
});

export const clientNotes = pgTable('client_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  noteType: noteTypeEnum('note_type').notNull().default('general'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const deliverables = pgTable('deliverables', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  deliverableType: text('deliverable_type').notNull(),
  status: deliverableStatusEnum('status').notNull().default('not_started'),
  content: text('content'),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  notes: text('notes'),
});

export const generatedPrompts = pgTable('generated_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  promptCode: text('prompt_code').notNull(),
  populatedPrompt: text('populated_prompt').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
  aiOutput: text('ai_output'),
});

export const revenueEntries = pgTable('revenue_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  amount: integer('amount').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  description: text('description'),
  entryType: text('entry_type').notNull().default('payment'),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  businessName: text('business_name'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  reviewed: boolean('reviewed').default(false),
});
