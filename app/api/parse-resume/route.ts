// app/api/parse-resume/route.ts
import { llmService } from '@/lib/ai/llm-service';
import { z } from 'zod';

const ParseResumeSchema = z.object({
  resumeText: z.string().min(50),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeText } = ParseResumeSchema.parse(body);

    console.log('Parsing resume with AI...');

    // const systemPrompt = `You are a resume parser. Extract structured information from resumes.

    // Return ONLY valid JSON in this exact format (no markdown, no extra text):
    // {
    // "summary": "brief professional summary (2-3 sentences)",
    // "skills": ["skill1", "skill2", ...] (extract ALL skills mentioned),
    // "workHistory": [
    //     {
    //     "company": "Company Name",
    //     "title": "Job Title",
    //     "startDate": "YYYY-MM",
    //     "endDate": "YYYY-MM" (or "Present" if current),
    //     "description": "Brief description of role",
    //     "achievements": ["quantifiable achievement 1", "achievement 2"]
    //     }
    // ],
    // "education": [
    //     {
    //     "school": "University Name",
    //     "degree": "Bachelor of Science" (full degree name),
    //     "field": "Computer Science",
    //     "endDate": "YYYY-MM"
    //     }
    // ]
    // }

    // IMPORTANT:
    // - Extract ALL work experience in chronological order (most recent first)
    // - Extract ALL skills (technical, soft skills, tools, languages)
    // - For dates, use YYYY-MM format
    // - If information is missing, use empty string or empty array
    // - achievements should be specific and quantifiable when possible`;

    const systemPrompt = `You are a resume parser. You MUST return ONLY valid JSON. NO explanations. NO markdown. NO <think> tags.

    CRITICAL RULES:
    1. Return ONLY the JSON object
    2. Do NOT include any text before or after the JSON
    3. Do NOT use markdown code blocks
    4. Do NOT use <think> tags
    5. Start your response with { and end with }

    Return this EXACT format:
    {
    "summary": "brief professional summary",
    "skills": ["skill1", "skill2"],
    "workHistory": [
        {
        "company": "Company Name",
        "title": "Job Title",
        "startDate": "YYYY-MM",
        "endDate": "YYYY-MM or Present",
        "description": "Brief description",
        "achievements": ["achievement 1", "achievement 2"]
        }
    ],
    "education": [
        {
        "school": "University Name",
        "degree": "Degree name",
        "field": "Field of study",
        "endDate": "YYYY-MM"
        }
    ]
    }

    Extract ALL information from the resume. Use empty arrays for missing sections.`;

    const userPrompt = `Parse this resume and extract structured information:\n\n${resumeText}`;

    const result = await llmService.generateStructuredOutput<{
      summary: string;
      skills: string[];
      workHistory: any[];
      education: any[];
    }>(systemPrompt, userPrompt, {
      name: "resume_parsing",
      description: "Parse resume into structured data",
      parameters: {},
    });

    console.log('Resume parsed successfully');

    return Response.json(result);

  } catch (error: any) {
    console.error('POST /api/parse-resume error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error.message || 'Failed to parse resume' },
      { status: 500 }
    );
  }
}