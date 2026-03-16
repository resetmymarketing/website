CREATE TYPE "public"."deliverable_status" AS ENUM('not_started', 'in_progress', 'generated', 'sent');--> statement-breakpoint
CREATE TYPE "public"."fit_rating" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."note_type" AS ENUM('general', 'interest_flag', 'analysis_note', 'session_note');--> statement-breakpoint
CREATE TYPE "public"."pipeline_stage" AS ENUM('inquiry', 'intake_submitted', 'fit_assessment', 'payment', 'analysis_prep', 'session_scheduled', 'session_complete', 'deliverables_sent', 'followup_scheduled', 'followup_complete');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'viewer');--> statement-breakpoint
CREATE TABLE "client_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"note_type" "note_type" DEFAULT 'general' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "pipeline_stage" DEFAULT 'inquiry' NOT NULL,
	"fit_rating" "fit_rating",
	"archetype" text,
	"time_tier" text,
	"inquiry_date" timestamp with time zone,
	"intake_date" timestamp with time zone,
	"payment_date" timestamp with time zone,
	"session_date" timestamp with time zone,
	"deliverables_sent_date" timestamp with time zone,
	"followup_date" timestamp with time zone,
	"followup_complete_date" timestamp with time zone,
	"price_paid" integer,
	"pricing_tier" text,
	"testimonial_received" boolean DEFAULT false,
	"testimonial_text" text,
	"referral_source" text,
	"referrals_given" integer DEFAULT 0,
	"intake_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"business_name" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"deliverable_type" text NOT NULL,
	"status" "deliverable_status" DEFAULT 'not_started' NOT NULL,
	"content" text,
	"generated_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "generated_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"prompt_code" text NOT NULL,
	"populated_prompt" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ai_output" text
);
--> statement-breakpoint
CREATE TABLE "revenue_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"description" text,
	"entry_type" text DEFAULT 'payment' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_prompts" ADD CONSTRAINT "generated_prompts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;