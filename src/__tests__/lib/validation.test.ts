import { describe, it, expect } from 'vitest';
import {
  quickAddClientSchema,
  contactFormSchema,
  loginSchema,
  stageTransitionSchema,
  noteSchema,
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
