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
    CRITICAL: You must output VALID JSON.
    - No markdown code blocks (no \`\`\`json).
    - No reasoning text or <think> tags in the final response.
    - Every property name and string must use double quotes (").
    - No trailing commas at the end of arrays.

    The JSON must follow this EXACT schema:
    {
      "matchScore": number,
      "strengths": string[],
      "gaps": string[],
      "recommendations": string[],
      "reasoning": string
    }`;

        const userPrompt = `Compare this resume to the job description and return the analysis as JSON.
        
    RESUME:
    ${resumeText}

    JOB DESCRIPTION:
    ${jobDescription}

    ${userProfile ? `ADDITIONAL INFO:
    - Skills: ${userProfile.skills.join(', ')}
    - Years of Experience: ${this.calculateExperience(userProfile.workHistory)}` : ''}

    REMINDER: Return ONLY the JSON object. Ensure the JSON is complete and not truncated.`;


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