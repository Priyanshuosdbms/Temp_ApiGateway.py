
import { ProviderType, ModelInfo } from '../types';

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getRunningModels = async (
  provider: ProviderType, 
  endpoint: string
): Promise<ModelInfo[]> => {
  const baseUrl = endpoint.replace(/\/$/, '');
  
  try {
    if (provider === ProviderType.OLLAMA) {
      // Ollama API: GET /api/tags
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch Ollama models');
      const data = await response.json();
      
      // Map Ollama format to internal format
      return (data.models || []).map((m: any) => ({
        id: m.name,
        name: m.name,
        size: m.size,
        details: m.details?.quantization_level || 'Unknown'
      }));
    } 
    else if (provider === ProviderType.VLLM) {
      // OpenAI Compatible: GET /v1/models
      const response = await fetch(`${baseUrl}/v1/models`);
      if (!response.ok) throw new Error('Failed to fetch vLLM models');
      const data = await response.json();
      
      // Map OpenAI format
      return (data.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        size: 0, // OpenAI format doesn't usually expose size
        details: 'vLLM/OpenAI'
      }));
    }
  } catch (error) {
    console.warn(`Could not fetch models from ${provider} at ${endpoint}`, error);
    return [];
  }
  return [];
};

export const generateStream = async function* (
  model: string,
  prompt: string,
  endpoint: string,
  provider: ProviderType
) {
  // Standardize endpoint (remove trailing slash)
  const baseUrl = endpoint.replace(/\/$/, '');
  
  try {
    let url = '';
    let body = {};

    // Configure request based on provider API standards
    if (provider === ProviderType.OLLAMA) {
      url = `${baseUrl}/api/chat`;
      body = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      };
    } else if (provider === ProviderType.VLLM) {
      // vLLM is OpenAI compatible
      url = `${baseUrl}/v1/chat/completions`;
      body = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 2048
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
       throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          if (provider === ProviderType.OLLAMA) {
            const json = JSON.parse(line);
            if (json.message?.content) {
              yield json.message.content;
            }
            if (json.done) return;
          } else if (provider === ProviderType.VLLM) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') return;
              const json = JSON.parse(dataStr);
              if (json.choices?.[0]?.delta?.content) {
                yield json.choices[0].delta.content;
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing chunk', e);
        }
      }
    }
  } catch (error) {
    console.error("Generation error:", error);
    yield `\n\n[System Error]: Could not reach ${endpoint}.\n\nCheck your CORS settings:\n1. For Ollama: set OLLAMA_ORIGINS="*"\n2. For vLLM: use --cors-allow-origins "*"`;
  }
};
