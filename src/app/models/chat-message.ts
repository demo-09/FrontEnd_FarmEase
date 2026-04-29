export interface ChatMessage {
  senderEmail: string;
  receiverEmail: string;
  content?: string;
  isVoice?: boolean;
  voiceUrl?: string;
}
