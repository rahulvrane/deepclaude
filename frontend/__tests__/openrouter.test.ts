import { OpenRouterClient, OPENROUTER_MODELS } from '../lib/openrouter';
import type { Message } from '../lib/types';

// Mock OpenAI client
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            id: 'test-id',
            choices: [{
              message: {
                role: 'assistant',
                content: 'Test response',
              },
              finish_reason: 'stop',
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          }),
        },
      },
    })),
  };
});

describe('OpenRouterClient', () => {
  const apiKey = 'test-api-key';
  const siteUrl = 'https://example.com';
  const siteName = 'Test Site';
  let client: OpenRouterClient;

  beforeEach(() => {
    client = new OpenRouterClient(apiKey, siteUrl, siteName);
  });

  describe('chat.completions.create', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
    ];

    it('should handle basic chat completion', async () => {
      const response = await client.chat.completions.create({
        model: 'deepseek-r1',
        messages,
      });

      expect(response).toEqual({
        id: 'test-id',
        choices: [{
          message: {
            role: 'assistant',
            content: 'Test response',
          },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      });
    });

    it('should map model names correctly', async () => {
      const createSpy = jest.spyOn(client.chat.completions, 'create');

      await client.chat.completions.create({
        model: 'deepseek-r1',
        messages,
      });

      expect(createSpy).toHaveBeenCalledWith({
        model: OPENROUTER_MODELS['deepseek-r1'],
        messages,
      });
    });

    it('should pass through unknown model names', async () => {
      const createSpy = jest.spyOn(client.chat.completions, 'create');
      const customModel = 'custom/model-name';

      await client.chat.completions.create({
        model: customModel,
        messages,
      });

      expect(createSpy).toHaveBeenCalledWith({
        model: customModel,
        messages,
      });
    });

    it('should handle optional parameters', async () => {
      const createSpy = jest.spyOn(client.chat.completions, 'create');

      await client.chat.completions.create({
        model: 'deepseek-r1',
        messages,
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      });

      expect(createSpy).toHaveBeenCalledWith({
        model: OPENROUTER_MODELS['deepseek-r1'],
        messages,
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      });
    });
  });
});