// lib/ai/llm-service.ts
import { AzureOpenAI } from "openai";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class LLMService {
  private client: AzureOpenAI | OpenAI;
  private deploymentName: string;
  private useAzure: boolean;

  constructor() {
    this.useAzure = !process.env.USE_OPENAI_DIRECT;
    
    if (this.useAzure) {
      this.client = new AzureOpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY!,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
      });
      this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "deepseek-r1";
    } else {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });
      this.deploymentName = "gpt-4o-mini";
    }
    
    console.log(`LLM Service initialized`);
    console.log(`Model: ${this.deploymentName}`);
  }

  /**
   * Extract JSON from DeepSeek R1 response that may contain <think> tags
   */

    private extractJSON(content: string): string {
    if (!content) return "";

    // 1. Remove <think> blocks
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // 2. Remove unclosed <think> tags
    if (cleaned.includes('<think>')) {
      cleaned = cleaned.split(/<think>/)[0] + (cleaned.split(/<\/think>/)[1] || "");
    }

    // 3. Strip Markdown blocks
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/gi, '');

    // 4. Find the actual JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      let finalJson = cleaned.substring(firstBrace, lastBrace + 1).trim();

      // --- NEW: REPAIR COMMON SYNTAX ERRORS ---
      // Remove trailing commas in arrays/objects: [1, 2, ] -> [1, 2]
      finalJson = finalJson.replace(/,\s*([\]}])/g, '$1');
      
      // Fix common missing quotes around property names if they exist
      // finalJson = finalJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      return finalJson;
    }

    return "";
  }



  async chat(messages: ChatCompletionMessageParam[], options?: { 
      temperature?: number; maxTokens?: number; }) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        temperature: options?.temperature ?? 0.1, // Lower temperature = more stable JSON
        max_tokens: options?.maxTokens ?? 4000,   // Increase to 4000
      });
  
      const content = response.choices[0].message.content || "";
      
      // Extract JSON from response (handles <think> tags)
      return this.extractJSON(content);
    } catch (error) {
      console.error("LLM Service Error:", error);
      throw new Error("Failed to get LLM response");
    }
  }

  async generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    tool: { name: string; description: string; parameters: any }
  ): Promise<T> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
      
      const cleanedResponse = await this.chat(messages);
      const parsed = JSON.parse(cleanedResponse);
      
      return parsed as T;
      
    } catch (error: any) {
      console.error('Structured output generation failed:', error);
      throw new Error(`Failed to generate structured output: ${error.message}`);
    }
  }
}

export const llmService = new LLMService();

// // lib/ai/llm-service.ts
// import { AzureOpenAI } from "openai";
// import OpenAI from "openai";
// import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// export class LLMService {
//   private client: AzureOpenAI | OpenAI;
//   private deploymentName: string;
//   private useAzure: boolean;

//   constructor() {
//     this.useAzure = !process.env.USE_OPENAI_DIRECT;
    
//     if (this.useAzure) {
//       this.client = new AzureOpenAI({
//         apiKey: process.env.AZURE_OPENAI_API_KEY!,
//         endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
//         apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
//       });
//       this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "deepseek-r1";
//     } else {
//       this.client = new OpenAI({
//         apiKey: process.env.OPENAI_API_KEY!,
//       });
//       this.deploymentName = "gpt-4o-mini";
//     }
    
//     console.log(`LLM Service initialized`);
//     console.log(`Model: ${this.deploymentName}`);
//   }

//   /**
//    * Extract JSON from DeepSeek R1 response that may contain <think> tags
//    */
//   private extractJSON(content: string): string {
//     console.log('extractJSON input length:', content.length);
//     console.log('Has closing </think> tag?', content.includes('</think>'));
    
//     let cleaned = content;
    
//     // DeepSeek R1 sometimes doesn't close the <think> tag
//     // Two strategies:
    
//     // Strategy 1: If there's a closing tag, remove the whole block
//     if (content.includes('</think>')) {
//       cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
//       console.log('Removed closed <think> tags');
//     } 
//     // Strategy 2: If <think> is never closed, remove everything from <think> to the first {
//     else if (content.includes('<think>')) {
//       const thinkStart = cleaned.indexOf('<think>');
//       const firstBrace = cleaned.indexOf('{');
      
//       if (thinkStart !== -1 && firstBrace !== -1 && firstBrace > thinkStart) {
//         // Remove everything from <think> to just before the {
//         cleaned = cleaned.substring(0, thinkStart) + cleaned.substring(firstBrace);
//         console.log('Removed unclosed <think> tag and everything before {');
//       }
//     }
    
//     console.log('After removing <think> (first 300 chars):', cleaned.substring(0, 300));
    
//     // Trim whitespace
//     cleaned = cleaned.trim();
    
//     // Remove markdown code blocks if present
//     if (cleaned.startsWith('```json')) {
//       cleaned = cleaned.replace(/^```json\s*/g, '');
//       cleaned = cleaned.replace(/```\s*$/g, '');
//     } else if (cleaned.startsWith('```')) {
//       cleaned = cleaned.replace(/^```\s*/g, '');
//       cleaned = cleaned.replace(/```\s*$/g, '');
//     }
    
//     // Trim again
//     cleaned = cleaned.trim();
    
//     // Final check: Extract from first { to last }
//     const firstBrace = cleaned.indexOf('{');
//     const lastBrace = cleaned.lastIndexOf('}');
    
//     if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
//       cleaned = cleaned.substring(firstBrace, lastBrace + 1);
//       console.log('JSON extracted successfully (first 200 chars):', cleaned.substring(0, 200));
//     } else {
//       console.log('No valid JSON braces found');
//     }
    
//     return cleaned;
//   }

//     async chat(messages: ChatCompletionMessageParam[], options?: {
//     temperature?: number;
//     maxTokens?: number;
//   }) {
//     try {
//       const response = await this.client.chat.completions.create({
//         model: this.deploymentName,
//         messages,
//         temperature: options?.temperature ?? 0.7,
//         max_tokens: options?.maxTokens ?? 2000,
//       });

//       const content = response.choices[0].message.content || "";
      
//       console.log('Raw API response (first 500 chars):', content.substring(0, 500));
      
//       // For DeepSeek, extract content after <think> tags
//       const cleaned = this.extractJSON(content);
      
//       console.log('Cleaned response (first 300 chars):', cleaned.substring(0, 300));
      
//       return cleaned;
//     } catch (error) {
//       console.error("LLM Service Error:", error);
//       throw new Error("Failed to get LLM response");
//     }
//   }

//   async generateStructuredOutput<T>(
//     systemPrompt: string,
//     userPrompt: string,
//     tool: { name: string; description: string; parameters: any }
//   ): Promise<T> {
//     try {
//       const messages: ChatCompletionMessageParam[] = [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ];
      
//       const cleanedResponse = await this.chat(messages);
      
//       console.log('Final response (first 300):', cleanedResponse.substring(0, 300));
      
//       // AGGRESSIVE FINAL CLEANING
//       let finalClean = cleanedResponse;
      
//       // Remove any remaining <think> tags (shouldn't be here but just in case)
//       finalClean = finalClean.replace(/<think>[\s\S]*?<\/think>/gi, '');
      
//       // Remove everything before the first {
//       const firstBrace = finalClean.indexOf('{');
//       if (firstBrace > 0) {
//         finalClean = finalClean.substring(firstBrace);
//       }
      
//       // Remove everything after the last }
//       const lastBrace = finalClean.lastIndexOf('}');
//       if (lastBrace !== -1 && lastBrace < finalClean.length - 1) {
//         finalClean = finalClean.substring(0, lastBrace + 1);
//       }
      
//       console.log('AGGRESSIVELY cleaned (first 200):', finalClean.substring(0, 200));
      
//       // Try to parse
//       const parsed = JSON.parse(finalClean);
//       console.log('JSON parsed successfully');
      
//       return parsed as T;
      
//     } catch (error: any) {
//       console.error('Failed:', error);
//       throw new Error(`Failed to generate structured output: ${error.message}`);
//     }
//   }
// }

// export const llmService = new LLMService();