import { config } from '../config/index.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaService {
  private useGroq: boolean;
  private useOllama: boolean;
  private groqApiKey?: string;
  private ollamaBaseUrl: string;
  private ollamaModel: string;

  constructor() {
    this.groqApiKey = config.groq?.apiKey;
    this.useGroq = !!this.groqApiKey && this.groqApiKey !== 'your_groq_api_key_here';
    this.ollamaBaseUrl = config.ollama.baseUrl;
    this.ollamaModel = config.ollama.model;
    this.useOllama = !this.useGroq;
    
    console.log('AI Service initialized:');
    console.log('- Using Groq:', this.useGroq);
    console.log('- Using Ollama:', this.useOllama);
  }

  async generate(prompt: string, system?: string): Promise<string> {
    if (this.useGroq) {
      return this.generateWithGroq(prompt, system);
    }
    return this.generateWithOllama(prompt, system);
  }

  private async generateWithGroq(prompt: string, system?: string): Promise<string> {
    try {
      const messages: ChatMessage[] = [];
      
      if (system) {
        messages.push({ role: 'system', content: system });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: JSON.stringify({
          model: config.groq?.model || 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq generate error:', error);
      throw error;
    }
  }

  private async generateWithOllama(prompt: string, system?: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt,
          system: system || 'You are a helpful AI assistant.',
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json() as { response?: string };
      return data.response || '';
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw new Error('Failed to generate response from AI');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (this.useGroq) {
      return this.chatWithGroq(messages);
    }
    return this.chatWithOllama(messages);
  }

  private async chatWithGroq(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const groqMessages: ChatMessage[] = messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      }));

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: JSON.stringify({
          model: config.groq?.model || 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq chat error:', response.status, errorText);
        throw new Error(`Groq chat error: ${response.status}`);
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq chat error:', error);
      throw error;
    }
  }

  private async chatWithOllama(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json() as { message?: { content?: string } };
      return data.message?.content || '';
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error('Failed to chat with AI');
    }
  }

  async checkHealth(): Promise<boolean> {
    if (this.useGroq) {
      return true;
    }
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getProvider(): string {
    return this.useGroq ? 'groq' : 'ollama';
  }
}

export const ollamaService = new OllamaService();
