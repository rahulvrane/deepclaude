import OpenAI from "openai";
import type { ApiClient, Message, ChatCompletionResponse } from "./types";

// Model pricing in USD per 1M tokens
export const MODEL_PRICING = {
  "deepseek/deepseek-r1": {
    prompt: 0.0002,
    completion: 0.0002
  },
  "anthropic/claude-3-sonnet": {
    prompt: 0.0015,
    completion: 0.0015
  }
} as const;

export const OPENROUTER_MODELS = {
  "deepseek-r1": "deepseek/deepseek-r1",
  "claude-3-sonnet": "anthropic/claude-3-sonnet",
} as const;

// Calculate costs based on token usage
export function calculateCosts(model: string, usage: TokenUsage): CostInfo {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || {
    prompt: 0.0002,
    completion: 0.0002
  };

  const promptCost = (usage.prompt_tokens / 1_000_000) * pricing.prompt;
  const completionCost = (usage.completion_tokens / 1_000_000) * pricing.completion;

  return {
    prompt_cost: promptCost,
    completion_cost: completionCost,
    total_cost: promptCost + completionCost,
    tokens: usage
  };
}

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

        const usage = response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined;

        const cost = usage ? calculateCosts(modelName, usage) : undefined;

        return {
          id: response.id,
          choices: response.choices.map(choice => ({
            message: {
              role: choice.message.role,
              content: choice.message.content || "",
            },
            finish_reason: choice.finish_reason || "stop",
          })),
          usage,
          cost,
        };
      },
    },
  };
}