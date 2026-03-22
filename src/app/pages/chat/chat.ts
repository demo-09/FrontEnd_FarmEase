import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, interval } from 'rxjs';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  messages: Message[];
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements OnInit, OnDestroy {
  auth = inject(AuthService);
  http = inject(HttpClient);
  
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  newMessage: string = '';
  contacts: ChatContact[] = [];
  activeContact!: ChatContact;
  myEmail: string = '';
  private pollSub?: Subscription;

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('CurrentUser') || '{}');
    this.myEmail = user?.email || '';
    
    this.loadContacts();

    // Poll for new messages every 3 seconds
    this.pollSub = interval(3000).subscribe(() => {
      if (this.activeContact) {
        this.loadHistory(this.activeContact, false);
      }
    });
  }

  ngOnDestroy() {
    if (this.pollSub) this.pollSub.unsubscribe();
  }

  loadContacts() {
    this.http.get<any[]>('http://localhost:5009/api/messages/contacts').subscribe({
      next: (users) => {
        this.contacts = users.map(u => ({
          id: u.email,
          name: u.fullName + (u.role ? ` (${u.role})` : ''),
          role: u.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=16a34a&color=fff`,
          online: true,
          messages: []
        }));

        // Keep the AI bot for fun
        this.contacts.unshift({
          id: 'ai-bot',
          name: 'FarmEase AI Assistant',
          role: 'ai',
          avatar: 'https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff',
          online: true,
          messages: [{ id: 1, text: 'Hello! I am your FarmEase AI. Ask me about weather, crop diseases, or marketplace trends!', sender: 'other', time: '10:00 AM' }]
        });

        if (this.contacts.length > 0) {
          this.selectContact(this.contacts[0]);
        }
      },
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  loadHistory(contact: ChatContact, scroll: boolean = true) {
    if (contact.id === 'ai-bot') return; // AI doesn't have backend history

    this.http.get<any[]>(`http://localhost:5009/api/messages/history/${contact.id}`).subscribe({
      next: (msgs) => {
        contact.messages = msgs.map(m => ({
          id: m.id,
          text: m.content,
          sender: m.senderEmail === this.myEmail ? 'me' : 'other',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        if (scroll) this.scrollToBottom();
      }
    });
  }

  selectContact(contact: ChatContact) {
    this.activeContact = contact;
    this.loadHistory(contact, true);
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeContact) return;

    const textPayload = this.newMessage.trim();
    this.newMessage = ''; // clear input early for UX

    // AI Bot simulation
    if (this.activeContact.id === 'ai-bot') {
      const msg: Message = { id: Date.now(), text: textPayload, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      this.activeContact.messages.push(msg);
      this.activeContact.isTyping = true;
      this.scrollToBottom();
      
      const userText = msg.text.toLowerCase();
      let aiResponseText = 'I am currently learning about that! Is there anything else I can help you with regarding farming?';
      
      if (userText.includes('weather') || userText.includes('rain')) {
        aiResponseText = 'The weather forecast for your region indicates a 60% chance of rain tomorrow. It is advisable to delay pesticide application until the weather clears.';
      } else if (userText.includes('disease') || userText.includes('yellow') || userText.includes('pest')) {
        aiResponseText = 'Yellowing leaves can be a sign of nitrogen deficiency or a fungal infection like Rust. I recommend taking a photo and consulting our Agri Experts in the chat list!';
      } else if (userText.includes('hello') || userText.includes('hi')) {
        aiResponseText = 'Hello! How can I assist you with your farming and marketplace needs today?';
      } else if (userText.includes('price') || userText.includes('sell')) {
        aiResponseText = 'Marketplace trends show Organic Tomatoes are currently selling at ₹45/kg. It is a great time to list your harvest!';
      }

      setTimeout(() => {
        this.activeContact.isTyping = false;
        const reply: Message = { id: Date.now(), text: `🤖 ${aiResponseText}`, sender: 'other', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        this.activeContact.messages.push(reply);
        this.scrollToBottom();
      }, 2000);
      return;
    }

    // Real Backend send
    const payload = { receiverEmail: this.activeContact.id, content: textPayload };
    this.http.post<any>('http://localhost:5009/api/messages', payload).subscribe({
      next: (m) => {
        this.activeContact.messages.push({
          id: m.id,
          text: m.content,
          sender: 'me',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to send message', err)
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatScrollContainer) {
          this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}
