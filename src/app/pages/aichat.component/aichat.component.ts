import {
  Component,
  signal,
  effect,
  ViewChild,
  ElementRef,
  inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GeminiService } from '../../services/gemini.service';

export interface ChatMessage {

  id: string;

  role: 'user' | 'assistant';

  text?: string;

  imageData?: string;

  imageUrl?: string;

  mimeType?: string;

  audioData?: string;

  audioUrl?: string;

  timestamp: Date;

  isVoiceNote?: boolean;

}

declare var cloudinary: any;

@Component({
  selector: 'app-aichat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aichat.component.html',
  styleUrls: ['./aichat.component.css']
})

export class AichatComponent
  implements AfterViewInit, OnDestroy {

  // ================= SERVICES =================

  private geminiService = inject(GeminiService);

  // ================= SIGNALS =================

  messages = signal<ChatMessage[]>([]);

  isLoading = signal(false);

  inputText = signal('');

  // ================= UI =================

  isRecording = false;

  // ================= VIEWCHILD =================

  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  // ================= AUDIO =================

  private recognition: any = null;

  private mediaRecorder: MediaRecorder | null = null;

  private audioChunks: Blob[] = [];

  // ================= CONSTRUCTOR =================

  constructor() {

    this.initSpeechRecognition();

    // FIXED EFFECT ERROR
    effect(() => {

      this.messages();

      setTimeout(() => {
        this.scrollToBottom();
      }, 100);

    });

  }

  // ================= INIT =================

  ngAfterViewInit(): void {

    this.addWelcomeMessage();

  }

  ngOnDestroy(): void {

    this.mediaRecorder
      ?.stream
      ?.getTracks()
      .forEach(track => track.stop());

  }

  // ================= SPEECH =================

  private initSpeechRecognition(): void {

    if ('webkitSpeechRecognition' in window) {

      this.recognition =
        new (window as any).webkitSpeechRecognition();

      this.recognition.lang = 'en-IN';

      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {

        const transcript =
          event.results[0][0].transcript;

        this.inputText.set(
          (this.inputText() + ' ' + transcript).trim()
        );

      };

    }

  }

  // ================= WELCOME =================

  private addWelcomeMessage(): void {

    const welcome: ChatMessage = {

      id: 'welcome-' + Date.now(),

      role: 'assistant',

      text:
        'Namaste! 🌱 Kem cho? I am your FarmEase AI assistant from Gujarat. How can I help you with your farming today?',

      timestamp: new Date()

    };

    this.messages.set([welcome]);

  }

  // ================= SCROLL =================

  private scrollToBottom(): void {

    if (!this.messagesContainer?.nativeElement) return;

    this.messagesContainer.nativeElement.scrollTop =
      this.messagesContainer.nativeElement.scrollHeight;

  }

  // ================= SEND MESSAGE =================

  async sendMessage(): Promise<void> {

    const text = this.inputText().trim();

    if (!text || this.isLoading()) return;

    // USER MESSAGE
    const userMsg: ChatMessage = {

      id: 'msg-' + Date.now(),

      role: 'user',

      text,

      timestamp: new Date()

    };

    this.messages.update(msgs => [
      ...msgs,
      userMsg
    ]);

    this.inputText.set('');

    this.isLoading.set(true);

    // IMAGE GENERATION
    const isImageRequest =
      text.toLowerCase().startsWith('generate image') ||
      text.toLowerCase().startsWith('draw') ||
      text.toLowerCase().startsWith('create an image');

    if (isImageRequest) {

      try {

        const imageData =
          await this.geminiService.generateFarmImage(text);

        const aiMsg: ChatMessage = {

          id: 'msg-' + Date.now(),

          role: 'assistant',

          text: 'Here is your generated image! 🌾',

          imageData,

          timestamp: new Date()

        };

        this.messages.update(msgs => [
          ...msgs,
          aiMsg
        ]);

      } catch (error) {

        console.error(error);

      } finally {

        this.isLoading.set(false);

      }

      return;

    }

    // NORMAL TEXT CHAT
    try {

      const response =
        await this.geminiService.sendMessage(text);

      const aiMsg: ChatMessage = {

        id: 'msg-' + Date.now(),

        role: 'assistant',

        text:
          response ??
          'I received your message 🌱',

        timestamp: new Date()

      };

      this.messages.update(msgs => [
        ...msgs,
        aiMsg
      ]);

    } catch (error) {

      console.error(error);

    } finally {

      this.isLoading.set(false);

    }

  }

  // ================= CLOUDINARY =================

  openCloudinaryUpload(): void {

    const widget = cloudinary.createUploadWidget(

      {
        cloudName: process.env['CLOUDINARY_CLOUD_NAME'] || '',

        uploadPreset: process.env['CLOUDINARY_UPLOAD_PRESET'] || '',

        sources: [
          'local',
          'camera',
          'url'
        ],

        multiple: false,

        resourceType: 'image'
      },

      async (error: any, result: any) => {

        if (
          !error &&
          result &&
          result.event === 'success'
        ) {

          const imageUrl =
            result.info.secure_url;

          // USER IMAGE MESSAGE
          const userMsg: ChatMessage = {

            id: 'msg-' + Date.now(),

            role: 'user',

            text: '📸 Uploaded Image',

            imageData: imageUrl,

            timestamp: new Date()

          };

          this.messages.update(msgs => [
            ...msgs,
            userMsg
          ]);

          this.isLoading.set(true);

          try {

            const blob =
              await fetch(imageUrl)
                .then(r => r.blob());

            const reader = new FileReader();

            reader.onload = async () => {

              const base64 =
                (reader.result as string)
                  .split(',')[1];

              const aiResponse =
                await this.geminiService.sendMessage(

                  'Analyze this farm image carefully.',

                  {
                    data: base64,
                    mimeType: blob.type
                  }

                );

              const aiMsg: ChatMessage = {

                id: 'msg-' + Date.now(),

                role: 'assistant',

                text: aiResponse,

                timestamp: new Date()

              };

              this.messages.update(msgs => [
                ...msgs,
                aiMsg
              ]);

              this.isLoading.set(false);

            };

            reader.readAsDataURL(blob);

          } catch (err) {

            console.error(err);

            this.isLoading.set(false);

          }

        }

      }

    );

    widget.open();

  }

  // ================= VOICE TO TEXT =================

  startVoiceToText(): void {

    if (this.recognition) {

      this.recognition.start();

    } else {

      alert(
        'Speech recognition works in Chrome or Edge.'
      );

    }

  }

  // ================= RECORD AUDIO =================

  async startVoiceNoteRecording(): Promise<void> {

    if (this.isRecording) return;

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      this.mediaRecorder =
        new MediaRecorder(stream);

      this.audioChunks = [];

      this.isRecording = true;

      this.mediaRecorder.ondataavailable =
        (e) => {

          this.audioChunks.push(e.data);

        };

      this.mediaRecorder.onstop = async () => {

        const audioBlob =
          new Blob(this.audioChunks, {
            type: 'audio/webm'
          });

        const reader = new FileReader();

        reader.onload = async () => {

          const audioData =
            reader.result as string;

          const userMsg: ChatMessage = {

            id: 'msg-' + Date.now(),

            role: 'user',

            audioData,

            isVoiceNote: true,

            timestamp: new Date()

          };

          this.messages.update(msgs => [
            ...msgs,
            userMsg
          ]);

          this.isLoading.set(true);

          try {

            const base64Audio =
              audioData.split(',')[1];

            const response =
              await this.geminiService.sendMessage(
                '',
                undefined,
                {
                  data: base64Audio,
                  mimeType: 'audio/webm'
                }
              );

            const aiMsg: ChatMessage = {

              id: 'msg-' + Date.now(),

              role: 'assistant',

              text: response,

              timestamp: new Date()

            };

            this.messages.update(msgs => [
              ...msgs,
              aiMsg
            ]);

          } catch (err) {

            console.error(err);

          } finally {

            this.isLoading.set(false);

          }

        };

        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track =>
          track.stop()
        );

      };

      this.mediaRecorder.start();

    } catch (err) {

      console.error(err);

      this.isRecording = false;

    }

  }

  stopVoiceNoteRecording(): void {

    if (
      this.mediaRecorder &&
      this.isRecording
    ) {

      this.mediaRecorder.stop();

      this.isRecording = false;

    }

  }

  // ================= GENERATE IMAGE =================

  async generateFarmImage(): Promise<void> {

    const prompt =
      window.prompt(
        'Describe the farm image you want 🌾'
      );

    if (!prompt) return;

    this.isLoading.set(true);

    try {

      const image =
        await this.geminiService.generateFarmImage(
          prompt
        );

      const aiMsg: ChatMessage = {

        id: 'msg-' + Date.now(),

        role: 'assistant',

        text: 'Generated farm image 🌱',

        imageData: image,

        timestamp: new Date()

      };

      this.messages.update(msgs => [
        ...msgs,
        aiMsg
      ]);

    } catch (err) {

      console.error(err);

    } finally {

      this.isLoading.set(false);

    }

  }

  // ================= RESET =================

  resetChat(): void {

    const confirmed =
      confirm('Reset chat history?');

    if (!confirmed) return;

    this.messages.set([]);

    this.addWelcomeMessage();

  }

  // ================= TRACKBY =================

  trackById(
    index: number,
    msg: ChatMessage
  ): string {

    return msg.id;

  }

}
