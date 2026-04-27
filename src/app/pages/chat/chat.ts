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
export class Chat implements OnInit, OnDestroy {

  public chatService = inject(ChatService);

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  newMessage = '';
  currentUserEmail = '';
  private pollInterval: any;

  constructor() {
    // Scroll to bottom whenever messages update
    effect(() => {
      const msgs = this.chatService.messages();
      if (msgs.length) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    const userStr = localStorage.getItem('CurrentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserEmail = user.email;
      } catch (e) { }
    }

    this.chatService.loadContacts();
    // Polling
    this.pollInterval = setInterval(() => {
      const selected = this.chatService.selectedContact();
      if (selected) {
        this.chatService.loadHistorySilently(selected.email);
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  selectContact(contact: Contact) {
    this.chatService.selectedContact.set(contact);
    this.chatService.loadHistory(contact.email);
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    this.newMessage = '';

    const selected = this.chatService.selectedContact();
    if (!selected) return;

    this.chatService.sendMessage(selected.email, text).subscribe({
      next: (msg) => {
        this.chatService.messages.update(msgs => [...msgs, msg]);
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to send message', err)
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatScrollContainer) {
          this.chatScrollContainer.nativeElement.scrollTop =
            this.chatScrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) { }
    }, 100);
  }
}
