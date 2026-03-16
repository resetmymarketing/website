/**
 * Prompt template system with auto-population from intake data.
 *
 * Each prompt template has placeholder tokens like {{q02}} that get
 * replaced with actual client intake answers before being used.
 */

export interface PromptTemplate {
  code: string;
  name: string;
  description: string;
  template: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    code: 'brand_voice',
    name: 'Brand Voice Analysis',
    description: 'Analyze the client brand voice based on their intake answers.',
    template: `Analyze the brand voice for a service-based business with the following details:

Business Name: {{q01}}
Services Offered: {{q02}}
Time in Business: {{q03}}
Ideal Client: {{q04}}
Differentiator: {{q05}}

Based on this information, identify:
1. Their natural brand voice characteristics
2. Tone recommendations for their target audience
3. Key phrases or language patterns they should adopt
4. What to avoid in their messaging`,
  },
  {
    code: 'content_strategy',
    name: 'Content Strategy',
    description: 'Generate a content strategy based on current marketing and goals.',
    template: `Create a focused content strategy for this business:

Business: {{q01}}
Services: {{q02}}
Ideal Client: {{q04}}
Current Platforms: {{q06}}
What Has Worked: {{q07}}
What Is Not Working: {{q08}}
Weekly Time Available: {{q09}}
Biggest Frustration: {{q10}}
Success Vision: {{q11}}

Provide:
1. Top 3 content pillars aligned with their services and audience
2. Platform-specific recommendations (focus on what they can sustain)
3. A realistic weekly content rhythm based on their time availability
4. Quick wins they can implement this week`,
  },
  {
    code: 'audience_clarity',
    name: 'Audience Clarity',
    description: 'Define the ideal audience profile from intake data.',
    template: `Help define a clear audience profile for this business:

Business: {{q01}}
Services: {{q02}}
Ideal Client Description: {{q04}}
What Makes Them Different: {{q05}}
Current Marketing: {{q06}}

Build out:
1. Primary audience persona (demographics, psychographics, pain points)
2. Where this audience spends time online
3. What messages would resonate with them
4. Common objections and how to address them`,
  },
  {
    code: 'marketing_reset_plan',
    name: 'Marketing Reset Plan',
    description: 'Full reset plan combining all intake data.',
    template: `Create a comprehensive marketing reset plan:

BUSINESS OVERVIEW
Business: {{q01}}
Services: {{q02}}
Years in Business: {{q03}}
Ideal Client: {{q04}}
Differentiator: {{q05}}

CURRENT STATE
Platforms Used: {{q06}}
What Works: {{q07}}
What Doesn't Work: {{q08}}
Time Available: {{q09}}
Biggest Frustration: {{q10}}

GOALS
Success Vision: {{q11}}
Specific Requests: {{q12}}

Deliver:
1. Assessment of current marketing alignment
2. Top 3 priorities for the next 90 days
3. Platform and channel recommendations
4. Content themes and messaging direction
5. Implementation timeline with realistic milestones`,
  },
];

export function populatePrompt(
  template: string,
  intakeData: Record<string, string | string[]> | null,
): string {
  if (!intakeData) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = intakeData[key];
    if (value === undefined) return `[${key}: not provided]`;
    return Array.isArray(value) ? value.join(', ') : value;
  });
}

export function getPromptTemplate(code: string): PromptTemplate | undefined {
  return promptTemplates.find((t) => t.code === code);
}
