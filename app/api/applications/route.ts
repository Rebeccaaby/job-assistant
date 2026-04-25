// app/api/applications/route.ts
import prisma from '@/lib/db';
import { TEST_USER_ID } from '@/lib/constants';

// GET /api/applications - List all applications with stats
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: applications.length,
      notSubmitted: applications.filter(a => a.status === 'NOT_SUBMITTED').length,
      submitted: applications.filter(a => a.status === 'SUBMITTED').length,
      interviews: applications.filter(a => 
        a.status === 'INTERVIEW_REQUESTED' || a.status === 'ONSITE_REQUESTED'
      ).length,
      rejected: applications.filter(a => 
        a.status === 'REJECTED_AFTER_APPLY' || a.status === 'REJECTED_AFTER_INTERVIEW'
      ).length,
      offers: applications.filter(a => a.status === 'OFFER_RECEIVED').length,
      avgMatchScore: applications.length > 0
        ? Math.round(
            applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / 
            applications.length
          )
        : 0,
    };

    return Response.json({ applications, stats });

  } catch (error: any) {
    console.error('GET /api/applications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}