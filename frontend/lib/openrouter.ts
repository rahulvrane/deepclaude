import OpenAI from "openai";
import type { ApiClient, Message, ChatCompletionResponse } from "./types";

export const OPENROUTER_MODELS = {
  "deepseek-r1": "deepseek/deepseek-r1",
  "claude-3-sonnet": "anthropic/claude-3-sonnet",
} as const;

export class OpenRouterClient implements ApiClient {
  private client: OpenAI;

  constructor(apiKey: string, siteUrl?: string, siteName: string = "DeepClaude") {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": siteUrl || "",
        "X-Title": siteName,
      },
    });
  }

  chat = {
    completions: {
      create: async (params: {
        model: string;
        messages: Message[];
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }): Promise<ChatCompletionResponse> => {
        const modelName = OPENROUTER_MODELS[params.model as keyof typeof OPENROUTER_MODELS] || params.model;
        
        const response = await this.client.chat.completions.create({
          ...params,
          model: modelName,
        });

        return {
          id: response.id,
          choices: response.choices.map(choice => ({
            message: {
              role: choice.message.role,
              content: choice.message.content || "",
            },
            finish_reason: choice.finish_reason || "stop",
          })),
          usage: response.usage ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          } : undefined,
        };
      },
    },
  };
}