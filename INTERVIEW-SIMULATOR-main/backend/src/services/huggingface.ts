import { config } from '../config/index.js';

interface HuggingFaceResponse {
  id: string;
  model: string;
  response: string;
  done: boolean;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class HuggingFaceService {
  private apiKey?: string;
  private model: string;
  private baseUrl = 'https://api-inference.huggingface.co';

  constructor() {
    this.apiKey = config.huggingface?.apiKey;
    this.model = config.huggingface?.model || 'microsoft/Phi-3.5-mini-instruct';
  }

  async generate(prompt: string, system?: string): Promise<string> {
    try {
      const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

      const response = await fetch(`${this.baseUrl}/models/${this.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey || ''}`,
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HuggingFace error:', response.status, errorText);
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      
      return String(data);
    } catch (error) {
      console.error('HuggingFace generate error:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey || ''}`,
        },
        body: JSON.stringify({
          inputs: this.formatChatPrompt(messages),
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HuggingFace chat error:', response.status, errorText);
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      
      return String(data);
    } catch (error) {
      console.error('HuggingFace chat error:', error);
      throw error;
    }
  }

  private formatChatPrompt(messages: ChatMessage[]): string {
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `<|system|>\n${msg.content}\n`;
      } else if (msg.role === 'user') {
        prompt += `<|user|>\n${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `<|assistant|>\n${msg.content}\n`;
      }
    }
    
    prompt += '<|assistant|>\n';
    return prompt;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getModel(): string {
    return this.model;
  }
}

export const huggingFaceService = new HuggingFaceService();
