// app/api/applications/[id]/route.ts
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  status: z.enum([
    'NOT_SUBMITTED',
    'SUBMITTED',
    'INITIAL_RESPONSE',
    'INTERVIEW_REQUESTED',
    'REJECTED_AFTER_APPLY',
    'REJECTED_AFTER_INTERVIEW',
    'ONSITE_REQUESTED',
    'OFFER_RECEIVED',
  ]).optional(),
  appliedDate: z.string().optional(),
});

// GET /api/applications/[id] - Get single application
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Changed to Promise
) {
  try {
    const { id } = await params;  // ← Await the params
    
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    return Response.json({ application });
  } catch (error: any) {
    console.error('GET /api/applications/[id] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/applications/[id] - Update application
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Changed to Promise
) {
  try {
    const { id } = await params;  // ← Await the params
    const body = await request.json();
    const { status, appliedDate } = UpdateSchema.parse(body);

    const application = await prisma.application.update({
      where: { id },  // ← Now using awaited id
      data: {
        status,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      },
    });

    return Response.json({ application });
  } catch (error: any) {
    console.error('PATCH /api/applications/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
}