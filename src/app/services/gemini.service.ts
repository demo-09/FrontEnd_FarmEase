import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI, ChatSession, GenerativeModel } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'model';
  text?: string;
  imageData?: string;
  mimeType?: string;
  audioData?: string;
  audioMimeType?: string;
  audioUrl?: string;        // ← For playing voice note
  duration?: string;        // ← For voice note duration
  isPlaying?: boolean;      // ← For play/pause state
  isImageGeneration?: boolean;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chatSession: ChatSession;

  public messages = signal<ChatMessage[]>([]);
  public isLoading = signal<boolean>(false);

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env['GEMINI_API_KEY'] || ''
    );
    console.log(this.genAI);

    const systemInstruction = `
You are FarmEase Assistant — a warm, knowledgeable, and super friendly AI farming buddy from Gujarat 🌱.
You sell premium seeds, organic fertilizers, and smart farming machinery.
Talk naturally like a helpful friend on WhatsApp.
`;

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction,
    });

    this.chatSession = this.model.startChat({ history: [] });
  }

  // IMPORTANT: Add this method
  addMessage(message: ChatMessage) {
    this.messages.update(msgs => [...msgs, message]);
  }

  async sendMessage(
    prompt: string = '',
    image?: { data: string; mimeType: string },
    audio?: { data: string; mimeType: string },
    isImageGen = false
  ): Promise<string> {
    if (!prompt.trim() && !image && !audio && !isImageGen) return '';

    try {
      let content: any[] = [];
      if (prompt) content.push({ text: prompt });
      if (image) content.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
      if (audio) {
        content.push({ text: "Please interpret this Indian agricultural voice note and reply contextually in English." });
        content.push({ inlineData: { mimeType: audio.mimeType, data: audio.data } });
      }

      const result = await this.chatSession.sendMessage(content);
      const responseText = result.response.text();

      this.speak(responseText);
      return responseText;
    } catch (error) {
      console.error('Gemini Error:', error);
      return 'Sorry bhai, something went wrong. Try again 🌾';
    }
  }

  async generateFarmImage(prompt: string): Promise<string> {
    try {
      this.isLoading.set(true);
      const enhancementPrompt = `Enhance this prompt for farm image generation: "${prompt}". Return ONLY the detailed, highly descriptive prompt. Include lighting, camera angles, and hyper-realistic style keywords for agriculture. Only English.`;
      
      const result = await this.model.generateContent(enhancementPrompt);
      const detailedPrompt = result.response.text().trim();
      
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(detailedPrompt)}?nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    } catch (e) {
      console.error('Image gen error:', e);
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
    } finally {
      this.isLoading.set(false);
    }
  }

  speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  resetChat() {
    this.chatSession = this.model.startChat({ history: [] });
    this.messages.set([]);
  }
}
