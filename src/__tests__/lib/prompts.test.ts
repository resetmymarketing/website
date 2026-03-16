import { describe, it, expect } from 'vitest';
import { populatePrompt, getPromptTemplate, promptTemplates } from '../../lib/prompts';

describe('populatePrompt', () => {
  it('replaces placeholders with intake data', () => {
    const template = 'Hello {{name}}, your business is {{q01}}.';
    const result = populatePrompt(template, { name: 'Jane', q01: 'Acme Corp' });
    expect(result).toBe('Hello Jane, your business is Acme Corp.');
  });

  it('marks missing values as not provided', () => {
    const template = 'Business: {{q01}}, Services: {{q02}}';
    const result = populatePrompt(template, { q01: 'Test Biz' });
    expect(result).toBe('Business: Test Biz, Services: [q02: not provided]');
  });

  it('returns template unchanged with null intake data', () => {
    const template = 'Hello {{name}}';
    const result = populatePrompt(template, null);
    expect(result).toBe('Hello {{name}}');
  });

  it('joins array values', () => {
    const template = 'Platforms: {{q06}}';
    const result = populatePrompt(template, { q06: ['Instagram', 'Facebook', 'Email'] });
    expect(result).toBe('Platforms: Instagram, Facebook, Email');
  });

  it('handles template with no placeholders', () => {
    const template = 'No placeholders here.';
    const result = populatePrompt(template, { q01: 'test' });
    expect(result).toBe('No placeholders here.');
  });
});

describe('getPromptTemplate', () => {
  it('returns a template by code', () => {
    const template = getPromptTemplate('brand_voice');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Brand Voice Analysis');
  });

  it('returns undefined for unknown code', () => {
    const template = getPromptTemplate('nonexistent');
    expect(template).toBeUndefined();
  });

  it('has all expected templates', () => {
    expect(promptTemplates.length).toBeGreaterThanOrEqual(4);
    const codes = promptTemplates.map((t) => t.code);
    expect(codes).toContain('brand_voice');
    expect(codes).toContain('content_strategy');
    expect(codes).toContain('audience_clarity');
    expect(codes).toContain('marketing_reset_plan');
  });
});
