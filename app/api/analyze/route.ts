// app/api/analyze/route.ts
import prisma from '@/lib/db';
import { TEST_USER_ID } from '@/lib/constants';
import { resumeScorerAgent } from '@/lib/ai/agents/resume-scorer';
import { z } from 'zod';

const AnalyzeSchema = z.object({
  jobUrl: z.string().url().optional(),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  jobDescription: z.string().min(50),
});

// POST /api/analyze - Analyze resume against job description
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobUrl, jobTitle, company, jobDescription } = AnalyzeSchema.parse(body);

    console.log('Starting resume analysis...');

    // 1. Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: TEST_USER_ID },
      include: { user: true },
    });

    if (!profile || !profile.resumeText) {
      return Response.json(
        { error: 'Please create your profile and add resume text first' },
        { status: 400 }
      );
    }

    // 2. Run AI analysis
    console.log('Running AI analysis...');
    const analysis = await resumeScorerAgent.analyze(
      profile.resumeText,
      jobDescription,
      {
        skills: profile.skills,
        workHistory: profile.workHistory as any[],
        education: profile.education as any[],
      }
    );

    console.log('Analysis complete. Match score:', analysis.matchScore);

    // 3. Save application to database
    const application = await prisma.application.create({
      data: {
        userId: TEST_USER_ID,
        jobTitle,
        company,
        jobUrl: jobUrl || '',
        jobDescription,
        matchScore: analysis.matchScore,
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        recommendations: analysis.recommendations,
        status: 'NOT_SUBMITTED',
      },
    });

    return Response.json({
      application,
      analysis,
    });

  } catch (error: any) {
    console.error('POST /api/analyze error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}