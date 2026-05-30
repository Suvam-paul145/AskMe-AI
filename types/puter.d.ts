// ===========================================
// Type declarations for Puter.js SDK (loaded via script tag)
// ===========================================

interface PuterAI {
  txt2img(
    prompt: string,
    options?: {
      model?: string;
      disable_safety_checker?: boolean;
      seed?: number;
      output_quality?: number;
      aspect_ratio?: { w: number; h: number };
      puter_output_path?: string;
    }
  ): Promise<HTMLImageElement>;

  chat(
    prompt: string,
    options?: {
      model?: string;
      stream?: boolean;
    }
  ): Promise<{ message: { content: string } }>;

  txt2speech(
    text: string,
    options?: {
      provider?: string;
      model?: string;
      voice?: string;
      instructions?: string;
      response_format?: string;
    }
  ): Promise<HTMLAudioElement>;
}

interface Puter {
  ai: PuterAI;
}

declare const puter: Puter;

interface Window {
  puter: Puter;
}
