// app/api/profile/route.ts
import prisma from "@/lib/db";
import { TEST_USER_ID } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    // Get or create profile for test user
    let profile = await prisma.profile.findUnique({
      where: { userId: TEST_USER_ID },
    });

    if (!profile) {
      // Create default profile
      profile = await prisma.profile.create({
        data: {
          userId: TEST_USER_ID,
          summary: "",
          workHistory: [],
          education: [],
          skills: [],
          resumeText: "",
        },
      });
    }

    return Response.json({ profile });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return Response.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summary, skills, workHistory, education, resumeText } = body;

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId: TEST_USER_ID },
      update: {
        summary,
        skills,
        workHistory,
        education,
        resumeText,
      },
      create: {
        userId: TEST_USER_ID,
        summary,
        skills,
        workHistory,
        education,
        resumeText,
      },
    });

    return Response.json({ profile });
  } catch (error: any) {
    console.error("POST /api/profile error:", error);
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}