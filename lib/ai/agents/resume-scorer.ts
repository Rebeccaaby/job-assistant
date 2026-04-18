// lib/ai/agents/resume-scorer.ts
import { llmService } from '../llm-service';
import { z } from 'zod';

const ResumeAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).max(5),
  gaps: z.array(z.string()).max(5),
  recommendations: z.array(z.string()).max(5),
  reasoning: z.string(),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

export class ResumeScorerAgent {
  async analyze(
    resumeText: string,
    jobDescription: string,
    userProfile?: {
      skills: string[];
      workHistory: any[];
      education: any[];
    }
  ): Promise<ResumeAnalysis> {
    const systemPrompt = `You are an expert resume analyzer and career coach.

Your job is to compare a candidate's resume against a job description and provide a match score with detailed feedback.

RESPONSE FORMAT: You must respond with ONLY a JSON object. No markdown, no explanations outside the JSON, no <think> tags.

The JSON must have this exact structure:
{
  "matchScore": <number between 0-100>,
  "strengths": [<array of 3-5 strings>],
  "gaps": [<array of 3-5 strings>],
  "recommendations": [<array of 3-5 strings>],
  "reasoning": "<brief explanation string>"
}`;

    const userPrompt = `Analyze this resume against the job description.

RESUME:
${resumeText}

${userProfile ? `
ADDITIONAL INFO:
- Skills: ${userProfile.skills.join(', ')}
- Years of Experience: ${this.calculateExperience(userProfile.workHistory)}
` : ''}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY the JSON object - no other text.`;

    try {
      const result = await llmService.generateStructuredOutput<ResumeAnalysis>(
        systemPrompt,
        userPrompt,
        {
          name: "resume_analysis",
          description: "Resume analysis with match score and recommendations",
          parameters: ResumeAnalysisSchema,
        }
      );

      // Validate the response matches our schema
      const validated = ResumeAnalysisSchema.parse(result);
      return validated;
      
    } catch (error: any) {
      console.error("Resume analysis failed:", error);
      
      // Provide a fallback response if AI fails
      console.warn("Returning fallback analysis due to error");
      return {
        matchScore: 50,
        strengths: ["Unable to analyze - using fallback data"],
        gaps: ["AI analysis failed - please try again"],
        recommendations: ["Check your API configuration"],
        reasoning: `Error: ${error.message}`,
      };
    }
  }

  private calculateExperience(workHistory: any[]): number {
    if (!workHistory || workHistory.length === 0) return 0;
    
    const totalMonths = workHistory.reduce((total, job) => {
      const start = new Date(job.startDate);
      const end = job.endDate ? new Date(job.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
    
    return Math.round(totalMonths / 12 * 10) / 10;
  }
}

export const resumeScorerAgent = new ResumeScorerAgent();