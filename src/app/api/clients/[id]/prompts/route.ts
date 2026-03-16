import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, generatedPrompts } from '@/lib/schema';
import { requireAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sanitizeString } from '@/lib/sanitize';
import { getPromptTemplate, populatePrompt, promptTemplates } from '@/lib/prompts';

const generatePromptSchema = z.object({
  promptCode: z.string().min(1).max(100),
});

const saveOutputSchema = z.object({
  promptId: z.string().uuid(),
  aiOutput: z.string().min(1).max(100000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Get client intake data for template preview
    const clientResult = await db
      .select({ intakeData: clients.intakeData })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    const client = clientResult[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get previously generated prompts
    const history = await db
      .select()
      .from(generatedPrompts)
      .where(eq(generatedPrompts.clientId, id));

    return NextResponse.json({
      templates: promptTemplates.map((t) => ({
        code: t.code,
        name: t.name,
        description: t.description,
      })),
      history,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const body: unknown = await request.json();
    const parsed = generatePromptSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const template = getPromptTemplate(parsed.data.promptCode);
    if (!template) {
      return NextResponse.json({ error: 'Unknown prompt template' }, { status: 400 });
    }

    const clientResult = await db
      .select({ intakeData: clients.intakeData })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    const client = clientResult[0];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const populated = populatePrompt(template.template, client.intakeData ?? null);

    const result = await db
      .insert(generatedPrompts)
      .values({
        clientId: id,
        promptCode: sanitizeString(parsed.data.promptCode),
        populatedPrompt: populated,
      })
      .returning({ id: generatedPrompts.id });

    return NextResponse.json(
      { id: result[0]?.id, populatedPrompt: populated },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    await params; // validate route param exists

    const body: unknown = await request.json();
    const parsed = saveOutputSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await db
      .update(generatedPrompts)
      .set({ aiOutput: sanitizeString(parsed.data.aiOutput) })
      .where(eq(generatedPrompts.id, parsed.data.promptId))
      .returning({ id: generatedPrompts.id });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to save AI output' }, { status: 500 });
  }
}
