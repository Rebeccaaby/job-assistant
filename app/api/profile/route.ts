import { prisma } from '@/lib/db';
import { TEST_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const ProfileSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()),
  workHistory: z.array(z.object({
    company: z.string(),
    title: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
    achievements: z.array(z.string()).optional(),
  })),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string().optional(),
    endDate: z.string(),
    gpa: z.string().optional(),
  })),
  resumeText: z.string().optional(),
});

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: TEST_USER_ID },
      include: { user: true },
    });

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ profile });
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/profile - Create or update profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ProfileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: TEST_USER_ID },
      update: validatedData,
      create: {
        ...validatedData,
        userId: TEST_USER_ID,
      },
      include: { user: true },
    });

    return Response.json({ profile });
  } catch (error: any) {
    console.error('POST /api/profile error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
}