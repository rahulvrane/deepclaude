import OpenAI from "openai";

export const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "",
    "X-Title": "DeepClaude",
  },
});

export const openRouterModels = {
  deepseek: "deepseek/deepseek-r1",
  claude: "anthropic/claude-3-sonnet",
} as const;