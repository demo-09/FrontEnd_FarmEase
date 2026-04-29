import { Component, ElementRef, ViewChild, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Contact } from '../../services/chat.service';
import { time } from 'console';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
// ... imports same as yours ...

export class Chat implements OnInit, OnDestroy {
  public chatService = inject(ChatService);
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  newMessage = '';
  currentUserEmail = '';
  private pollInterval: any;

  constructor() {
    effect(() => {
      if (this.chatService.messages().length) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    const userStr = localStorage.getItem('CurrentUser');
    if (userStr) {
      this.currentUserEmail = JSON.parse(userStr).email;
    }
    this.chatService.loadContacts();

    // Polling logic
    this.pollInterval = setInterval(() => {
      const selected = this.chatService.selectedContact();
      if (selected) {
        this.chatService.loadHistorySilently(selected.email);
      }
    }, 3000);
  }

  selectContact(contact: Contact) {
    this.chatService.selectedContact.set(contact);
    this.chatService.loadHistory(contact.email);
  }

  // Mobile navigation helper
  closeChat() {
    this.chatService.selectedContact.set(null);
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    const selected = this.chatService.selectedContact();
    if (!selected) return;

    this.newMessage = ''; // Optimistic UI clear

    this.chatService.sendMessage(selected.email, text).subscribe({
      next: (msg) => {
        this.chatService.messages.update(msgs => [...msgs, msg]);
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop =
          this.chatScrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
