import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  id?: number;
  senderEmail: string;
  receiverEmail: string;
  content: string; 
  sentAt?: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'https://backend-farmease-1.onrender.com/api/Messages';

  public contacts = signal<Contact[]>([]);
  public messages = signal<ChatMessage[]>([]);
  public selectedContact = signal<Contact | null>(null);
  public isLoading = signal<boolean>(false);

  loadContacts() {
    this.http.get<Contact[]>(`${this.apiUrl}/contacts`).subscribe({
      next: (data) => this.contacts.set(data),
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  loadHistory(otherEmail: string) {
    this.isLoading.set(true);
    this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${otherEmail}`).subscribe({
      next: (data) => {
        this.messages.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading.set(false);
      }
    });
  }

  loadHistorySilently(otherEmail: string) {
    this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${otherEmail}`).subscribe({
      next: (data) => {
        this.messages.set(data);
      },
      error: (err) => console.error('Failed to load history silently', err)
    });
  }

  sendMessage(receiverEmail: string, content: string) {
    return this.http.post<ChatMessage>(this.apiUrl, { receiverEmail, content });
  }
}
