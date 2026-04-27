import { Component, signal, effect, ViewChild, ElementRef, inject, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageData?: string;
  mimeType?: string;
  audioData?: string;
  timestamp: Date;
  isVoiceNote?: boolean;
}

@Component({
  selector: 'app-aichat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aichat.component.html',
  styleUrls: ['./aichat.component.css']
})
export class AichatComponent implements AfterViewInit, OnDestroy {

  private geminiService = inject(GeminiService);

  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  inputText = signal('');

  isRecording = false;                    // ← Must be public for template

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.initSpeechRecognition();
  }

  ngAfterViewInit(): void {
    this.addWelcomeMessage();
    effect(() => {
      this.messages();
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.mediaRecorder?.stream?.getTracks().forEach(track => track.stop());
  }

  private initSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.lang = 'en-IN';
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.inputText.set((this.inputText() + ' ' + transcript).trim());
      };
    }
  }

  private addWelcomeMessage(): void {
    const welcome: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      text: 'Namaste! 🌱 Kem cho? I am your FarmEase AI assistant from Gujarat. How can I help you with your farming today?',
      timestamp: new Date()
    };
    this.messages.set([welcome]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 150);
  }

  // ====================== SEND MESSAGE ======================
  async sendMessage(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    this.inputText.set('');
    this.isLoading.set(true);

    const isImageRequest = text.toLowerCase().startsWith('generate image') || text.toLowerCase().startsWith('draw') || text.toLowerCase().startsWith('create an image');

    if (isImageRequest) {
      try {
        const imageData = await this.geminiService.generateFarmImage(text);
        const aiMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: 'Here is your generated image! 🌾',
          imageData: imageData,
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, aiMsg]);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading.set(false);
      }
      return;
    }

    // Normal Text
    try {
      const response = await this.geminiService.sendMessage(text);
      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: response ?? "I've received your message. How else can I help you today?",
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ====================== IMAGE UPLOAD ======================
  async onImageUpload(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result as string;

      const userMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'user',
        text: '📸 Sent farm photo',
        imageData,
        mimeType: file.type,
        timestamp: new Date()
      };

      this.messages.update(msgs => [...msgs, userMsg]);
      this.isLoading.set(true);

      try {
        const response = await this.geminiService.sendMessage(
          `Please analyze this farm image carefully.`,
          { data: imageData.split(',')[1], mimeType: file.type }
        );
        const aiMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: response ?? "I've analyzed the uploaded image.",
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, aiMsg]);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading.set(false);
      }
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  // ====================== VOICE TO TEXT ======================
  startVoiceToText(): void {
    if (this.recognition) {
      this.recognition.start();
    } else {
      alert('Speech recognition is not supported. Please use Chrome or Edge.');
    }
  }

  // ====================== VOICE NOTE ======================
  async startVoiceNoteRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onload = async () => {
          const audioData = reader.result as string;

          const userMsg: ChatMessage = {
            id: 'msg-' + Date.now(),
            role: 'user',
            audioData,
            isVoiceNote: true,
            timestamp: new Date()
          };

          this.messages.update(msgs => [...msgs, userMsg]);
          this.isLoading.set(true);

          try {
            // Remove the data:audio/webm;base64, prefix for the raw API payload
            const base64Audio = audioData.split(',')[1];
            
            const response = await this.geminiService.sendMessage(
              '', 
              undefined, 
              { data: base64Audio, mimeType: 'audio/webm' }
            );
            
            const aiMsg: ChatMessage = {
              id: 'msg-' + Date.now(),
              role: 'assistant',
              text: response ?? "I've listened to your voice note.",
              timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, aiMsg]);
          } catch (error) {
            console.error(error);
          } finally {
            this.isLoading.set(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err) {
      console.error('Microphone access error:', err);
      this.isRecording = false;
    }
  }

  stopVoiceNoteRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  // ====================== GENERATE FARM IMAGE ======================
  async generateFarmImage(): Promise<void> {
    const userPrompt = window.prompt('Describe the farm image you want to generate:\n(e.g. lush green cotton field in Gujarat at sunrise)');
    if (!userPrompt) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: `🖼️ Generate: ${userPrompt}`,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);

    try {
      const imageData = await this.geminiService.generateFarmImage(userPrompt);

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: 'Here is your generated farm image 🌾',
        imageData: imageData ?? undefined,   // Safe assignment
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  resetChat(): void {
    if (confirm('Reset this chat history?')) {
      this.messages.set([]);
      this.addWelcomeMessage();
    }
  }

  // Used for ngFor tracking
  trackById(index: number, msg: ChatMessage): string {
    return msg.id;
  }
}
