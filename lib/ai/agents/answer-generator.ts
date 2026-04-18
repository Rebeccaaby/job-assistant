// lib/ai/agents/answer-generator.ts
import { llmService } from '../llm-service';

export class AnswerGeneratorAgent {
  async generate(
    question: string,
    jobDescription: string,
    userProfile: {
      name: string;
      summary?: string;
      skills: string[];
      workHistory: any[];
      education: any[];
    }
  ): Promise<{
    answer: string;
    reasoning: string;
  }> {
    const systemPrompt = `You are an expert career coach helping candidates write compelling application answers.

Your answers should:
- Be specific and draw from the candidate's actual experience
- Align with the job requirements
- Be professional but authentic
- Be concise (150-250 words unless otherwise specified)
- Use the STAR method when appropriate (Situation, Task, Action, Result)

RESPONSE FORMAT: Respond with ONLY a JSON object containing "answer" and "reasoning" fields. No markdown, no <think> tags, just pure JSON.`;

    const userPrompt = `Generate a tailored answer to this application question.

QUESTION:
${question}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
Name: ${userProfile.name}
${userProfile.summary ? `Summary: ${userProfile.summary}` : ''}
Skills: ${userProfile.skills.join(', ')}

Work Experience:
${userProfile.workHistory.map((job: any, i: number) => `
${i + 1}. ${job.title} at ${job.company} (${job.startDate} - ${job.endDate || 'Present'})
   ${job.description}
   ${job.achievements ? `Achievements: ${job.achievements.join('; ')}` : ''}
`).join('\n')}

Education:
${userProfile.education.map((edu: any) => `
- ${edu.degree} in ${edu.field} from ${edu.school} (${edu.endDate})
`).join('\n')}

Respond with ONLY this JSON format:
{
  "answer": "the tailored answer to the question",
  "reasoning": "brief explanation of why this answer is effective"
}`;

    try {
      const result = await llmService.generateStructuredOutput<{
        answer: string;
        reasoning: string;
      }>(systemPrompt, userPrompt, {
        name: "answer_generation",
        description: "Generate tailored application answer",
        parameters: {
          type: "object",
          properties: {
            answer: { type: "string" },
            reasoning: { type: "string" },
          },
          required: ["answer", "reasoning"],
        },
      });

      return result;
      
    } catch (error: any) {
      console.error("Answer generation failed:", error);
      
      // Fallback response
      return {
        answer: "I am interested in this position because my experience aligns well with the requirements. [AI generation failed - please try again or edit this answer]",
        reasoning: `Error: ${error.message}`,
      };
    }
  }
}

export const answerGeneratorAgent = new AnswerGeneratorAgent();