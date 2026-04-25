// app/api/answer/route.ts
import prisma from '@/lib/db';
import { TEST_USER_ID } from '@/lib/constants';
import { answerGeneratorAgent } from '@/lib/ai/agents/answer-generator';
import { z } from 'zod';

const AnswerSchema = z.object({
  applicationId: z.string(),
  question: z.string().min(5),
});

// POST /api/answer - Generate tailored answer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, question } = AnswerSchema.parse(body);

    console.log('Generating answer for question:', question);

    // 1. Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: TEST_USER_ID },
      include: { user: true },
    });

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Get application for job context
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Generate answer with AI
    console.log('Generating tailored answer...');
    const result = await answerGeneratorAgent.generate(
      question,
      application.jobDescription,
      {
        name: profile.user.name,
        summary: profile.summary || undefined,
        skills: profile.skills,
        workHistory: profile.workHistory as any[],
        education: profile.education as any[],
      }
    );

    // 4. Save answer to application
    const currentAnswers = (application.tailoredAnswers as any) || {};
    currentAnswers[question] = {
      answer: result.answer,
      reasoning: result.reasoning,
      generatedAt: new Date().toISOString(),
    };

    await prisma.application.update({
      where: { id: applicationId },
      data: { tailoredAnswers: currentAnswers },
    });

    console.log('Answer generated successfully');

    return Response.json(result);

  } catch (error: any) {
    console.error('POST /api/answer error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error.message || 'Answer generation failed' },
      { status: 500 }
    );
  }
}