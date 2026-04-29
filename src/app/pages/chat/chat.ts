import { Component, ElementRef, ViewChild, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Contact } from '../../services/chat.service';

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

  getAvatarUrl(contact: any): string {
    if (contact?.avatar) return contact.avatar;
    const name = contact?.fullName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff&bold=true`;
  }

  newMessage = '';
  currentUserEmail = '';
  private pollInterval: any;

  constructor() {
    // Auto-scroll effect: triggers whenever the messages signal updates
    effect(() => {
      if (this.chatService.messages().length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    const userStr = localStorage.getItem('CurrentUser');
    if (userStr) {
      try {
        this.currentUserEmail = JSON.parse(userStr).email;
      } catch (e) { console.error("Session error", e); }
    }

    this.chatService.loadContacts();

    // Polling: Checks for new messages every 3 seconds
    this.pollInterval = setInterval(() => {
      const selected = this.chatService.selectedContact();
      if (selected) {
        this.chatService.loadHistorySilently(selected.email);
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  selectContact(contact: Contact) {
    this.chatService.selectedContact.set(contact);
    this.chatService.loadHistory(contact.email);
  }

  // Closes chat on mobile to show contacts/global nav again
  closeChat() {
    this.chatService.selectedContact.set(null);
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    const selected = this.chatService.selectedContact();
    if (!selected) return;

    this.newMessage = ''; // UI Reset

    this.chatService.sendMessage(selected.email, text).subscribe({
      next: (msg) => {
        this.chatService.messages.update(msgs => [...msgs, msg]);
      },
      error: (err) => console.error('Send failed', err)
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
