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
    // DeepSeek R1 often returns: <think>reasoning...</think>\n{json}
    // We need to extract just the JSON part
    
    // Remove <think>...</think> tags and everything inside them
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    // If it starts with ```json, remove markdown code blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    // Find the first { and last } to extract JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  async chat(messages: ChatCompletionMessageParam[], options?: {
    temperature?: number;
    maxTokens?: number;
  }) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1500,
      });

      const content = response.choices[0].message.content || "";
      
      // For DeepSeek, extract content after <think> tags
      return this.extractJSON(content);
    } catch (error) {
      console.error("LLM Service Error:", error);
      throw new Error("Failed to get LLM response");
    }
  }

  async generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    schema?: {
      name: string;
      description: string;
      parameters: any;
    }
  ): Promise<T> {
    try {
      // For DeepSeek R1, we need to be explicit about JSON-only output
      const enhancedSystemPrompt = `${systemPrompt}

CRITICAL: You must respond with ONLY valid JSON. Do not include any <think> tags, explanations, or markdown formatting in your response. Just pure JSON that matches the schema.`;

      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      let content = response.choices[0].message.content || "{}";
      
      console.log("Raw LLM Response (first 200 chars):", content.substring(0, 200));
      
      // Extract JSON from DeepSeek response
      content = this.extractJSON(content);
      
      console.log("Extracted JSON (first 200 chars):", content.substring(0, 200));
      
      // Parse and return
      const parsed = JSON.parse(content);
      return parsed as T;
      
    } catch (error: any) {
      console.error("Structured output generation failed:", error);
      
      // More detailed error logging
      if (error instanceof SyntaxError) {
        console.error("JSON Parse Error - This means the LLM didn't return valid JSON");
        console.error("This is common with DeepSeek R1 - trying alternative approach...");
      }
      
      throw new Error(`Failed to generate structured output: ${error.message}`);
    }
  }
}

export const llmService = new LLMService();