import { describe, it, expect } from 'vitest';
import {
  quickAddClientSchema,
  contactFormSchema,
  loginSchema,
  stageTransitionSchema,
  noteSchema,
  publicIntakeSchema,
} from '@/lib/validation';

describe('quickAddClientSchema', () => {
  it('accepts valid input', () => {
    const result = quickAddClientSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      businessName: 'Jane Co',
      serviceType: 'Consulting',
    });
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = quickAddClientSchema.safeParse({
      email: 'jane@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('requires valid email', () => {
    const result = quickAddClientSchema.safeParse({
      name: 'Jane',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = quickAddClientSchema.safeParse({
      name: '',
      email: 'jane@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('enforces max length on name', () => {
    const result = quickAddClientSchema.safeParse({
      name: 'a'.repeat(201),
      email: 'jane@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('contactFormSchema', () => {
  it('accepts valid input', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'I need help with my marketing strategy.',
    });
    expect(result.success).toBe(true);
  });

  it('requires message of at least 10 characters', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message over 2000 characters', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'securepass123',
    });
    expect(result.success).toBe(true);
  });

  it('requires password of at least 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('stageTransitionSchema', () => {
  it('accepts valid stage', () => {
    const result = stageTransitionSchema.safeParse({ newStage: 'intake_submitted' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid stage', () => {
    const result = stageTransitionSchema.safeParse({ newStage: 'invalid_stage' });
    expect(result.success).toBe(false);
  });
});

describe('noteSchema', () => {
  it('accepts valid note', () => {
    const result = noteSchema.safeParse({
      content: 'Client seems enthusiastic about the reset.',
      noteType: 'general',
    });
    expect(result.success).toBe(true);
  });

  it('requires content', () => {
    const result = noteSchema.safeParse({
      content: '',
      noteType: 'general',
    });
    expect(result.success).toBe(false);
  });

  it('defaults noteType to general', () => {
    const result = noteSchema.safeParse({ content: 'A note.' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe('general');
    }
  });
});

describe('publicIntakeSchema', () => {
  const validSubmission = {
    q02_client_name: 'Jane Doe',
    q03_email: 'jane@example.com',
    q48_consent: true as const,
  };

  it('accepts minimal valid submission', () => {
    const result = publicIntakeSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('accepts full valid submission with combined fields', () => {
    const result = publicIntakeSchema.safeParse({
      q01_business_name: 'Jane Co',
      q02_client_name: 'Jane Doe',
      q03_email: 'jane@example.com',
      q04_city_state: 'Austin, TX',
      q05_service_type: 'Hair Stylist',
      q06_years_in_business: '5',
      q07_q08_services: 'Cuts and color -- color brings in the most revenue.',
      q08b_elevator_pitch: 'I help people feel confident.',
      q08c_passion_purpose: 'I started because I love making people feel beautiful.',
      q09_schedule_fullness: 'mostly_full',
      q10_capacity_to_add: '3-5 new clients',
      q11_current_stage: 'growing',
      q11_current_stage_other: 'Custom stage description',
      q12_primary_goal: 'more_clients',
      q13_marketing_confidence: 3,
      q14_ideal_client: 'Busy professionals who value self-care.',
      q15_clients_to_avoid: 'Last-minute cancellers.',
      q16_problems_solved: 'Confidence and appearance.',
      q17_client_sources: ['referrals', 'instagram'],
      q19_what_works: 'Word of mouth.',
      q19b_why_clients_return: 'Results and vibe.',
      q19c_rebooking_system: 'yes',
      q20_what_didnt_work: 'Paid ads.',
      q21_marketing_approach: 'inconsistent',
      q22_q23_marketing_feelings: ['overwhelmed', 'not_enough_time'],
      q24_social_active: 'yes',
      q25_platforms_used: ['instagram', 'facebook'],
      q27_best_content: 'Before and afters.',
      q28_stopped_reason: ['no_time', 'not_sure_what_to_post'],
      q29_tolerable_activity: 'photos',
      q30_q31_service_focus: 'Focus on color, phase out basic cuts.',
      q32_q33_pricing: '$80 average, $300 highest',
      q34_no_shows_impact: 'sometimes',
      q35_q36_tech_comfort: 'comfortable -- use AI occasionally',
      q36b_ai_frequency: 'weekly',
      q37_help_wanted: ['content_creation', 'scheduling'],
      q38_time_for_marketing: '2-3 hours',
      q39_biggest_constraints: ['time', 'energy'],
      q40_success_90_days: 'Booked solid, 5-star reviews.',
      q40b_voice_personality: 'Warm, direct, no-nonsense.',
      q40c_content_enjoyment: ['photos', 'short_video'],
      q40d_client_faqs: 'How long? What products?',
      q40e_client_transformation: 'They leave confident and glowing.',
      q40f_seasonality: 'Prom season in May.',
      q40g_solo_or_team: 'solo',
      links_website: 'https://janedoe.com',
      links_gmb: 'https://g.page/janedoe',
      links_booking: 'https://booksy.com/janedoe',
      links_yelp: 'https://yelp.com/janedoe',
      links_other: 'https://linktree.com/janedoe',
      socials_instagram: 'https://instagram.com/janedoe',
      socials_facebook: 'https://facebook.com/janedoe',
      socials_tiktok: 'https://tiktok.com/@janedoe',
      socials_other1: '',
      socials_other2: '',
      q47_anything_else: 'Looking forward to clarity.',
      q48_consent: true as const,
    });
    expect(result.success).toBe(true);
  });

  it('requires q02_client_name', () => {
    const result = publicIntakeSchema.safeParse({
      q03_email: 'jane@example.com',
      q48_consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires q03_email to be a valid email', () => {
    const result = publicIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q03_email: 'not-an-email',
      q48_consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires q48_consent to be literal true', () => {
    const result = publicIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q03_email: 'jane@example.com',
      q48_consent: false,
    });
    expect(result.success).toBe(false);
  });

  it('q39_biggest_constraints accepts an array of strings', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q39_biggest_constraints: ['time', 'energy', 'money'],
    });
    expect(result.success).toBe(true);
  });

  it('q22_q23_marketing_feelings accepts an array of strings', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q22_q23_marketing_feelings: ['overwhelmed', 'not_sure_what_works'],
    });
    expect(result.success).toBe(true);
  });

  it('q40c_content_enjoyment accepts an array of strings', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40c_content_enjoyment: ['photos', 'reels', 'stories'],
    });
    expect(result.success).toBe(true);
  });

  it('q11_current_stage_other accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q11_current_stage_other: 'In a transition phase',
    });
    expect(result.success).toBe(true);
  });

  it('q07_q08_services accepts a combined string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q07_q08_services: 'Cuts, color, and highlights -- color services are most profitable.',
    });
    expect(result.success).toBe(true);
  });

  it('q30_q31_service_focus accepts a combined string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q30_q31_service_focus: 'Focus on extensions; phase out basic trims.',
    });
    expect(result.success).toBe(true);
  });

  it('q32_q33_pricing accepts a combined string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q32_q33_pricing: '$75 average, $250 highest',
    });
    expect(result.success).toBe(true);
  });

  it('q35_q36_tech_comfort accepts a combined string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q35_q36_tech_comfort: 'Pretty comfortable -- use Canva and basic AI tools',
    });
    expect(result.success).toBe(true);
  });

  it('link table fields accept URL strings', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      links_website: 'https://example.com',
      links_gmb: 'https://g.page/example',
      links_booking: 'https://calendly.com/example',
      links_yelp: 'https://yelp.com/biz/example',
      links_other: 'https://linktree.com/example',
      socials_instagram: 'https://instagram.com/example',
      socials_facebook: 'https://facebook.com/example',
      socials_tiktok: 'https://tiktok.com/@example',
    });
    expect(result.success).toBe(true);
  });

  it('q08c_passion_purpose accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q08c_passion_purpose: 'I started this business to help people in my community.',
    });
    expect(result.success).toBe(true);
  });

  it('q36b_ai_frequency accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q36b_ai_frequency: 'A few times a week',
    });
    expect(result.success).toBe(true);
  });

  it('q40b_voice_personality accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40b_voice_personality: 'Warm, funny, and straight to the point.',
    });
    expect(result.success).toBe(true);
  });

  it('q40d_client_faqs accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40d_client_faqs: 'How long does it take? Do you offer payment plans?',
    });
    expect(result.success).toBe(true);
  });

  it('q40e_client_transformation accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40e_client_transformation: 'They feel seen, confident, and ready to take on the world.',
    });
    expect(result.success).toBe(true);
  });

  it('q40f_seasonality accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40f_seasonality: 'Summer weddings are my busiest season.',
    });
    expect(result.success).toBe(true);
  });

  it('q40g_solo_or_team accepts a string', () => {
    const result = publicIntakeSchema.safeParse({
      ...validSubmission,
      q40g_solo_or_team: 'Solo -- just me for now.',
    });
    expect(result.success).toBe(true);
  });
});
