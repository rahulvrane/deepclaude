export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CostInfo {
  total_cost: number;
  prompt_cost: number;
  completion_cost: number;
  tokens: TokenUsage;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: TokenUsage;
  cost?: CostInfo;
}

export interface ApiClient {
  chat: {
    completions: {
      create: (params: {
        model: string;
        messages: Message[];
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }) => Promise<ChatCompletionResponse>;
    };
  };
}

export interface ApiTokens {
  deepseekApiToken: string;
  anthropicApiToken: string;
  openrouterApiToken?: string;
}