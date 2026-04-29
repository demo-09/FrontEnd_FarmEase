import { Injectable, signal } from '@angular/core';

export interface InboxMessage {
  id: string;
  type: string;
  title: string;
  requester: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'info';
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminInboxService {
  // Global reactive state holds all incoming admin approvals
  messages = signal<InboxMessage[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('admin_inbox_logs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        this.messages.set(mapped);
      } catch (e) {
        console.error('Failed to parse admin inbox logs', e);
        this.initDefault();
      }
    } else {
      this.initDefault();
    }
  }

  private saveToStorage() {
    localStorage.setItem('admin_inbox_logs', JSON.stringify(this.messages()));
  }

  private initDefault() {
    this.messages.set([
      {
        id: 'REQ-1001',
        type: 'user_alert',
        title: 'New Farmer Registration Pending',
        requester: 'Ramesh Singh',
        details: 'Attempting to register account with region Maharashtra. Awaiting background check.',
        timestamp: new Date(Date.now() - 3600000),
        status: 'pending'
      }
    ]);
    this.saveToStorage();
  }

  sendMessage(msg: Omit<InboxMessage, 'id' | 'timestamp' | 'status'> & { status?: InboxMessage['status'] }) {
    const newMsg: InboxMessage = {
      ...msg,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date(),
      status: msg.status || 'pending'
    };

    // Prepend to array
    this.messages.update(msgs => [newMsg, ...msgs]);
    this.saveToStorage();
  }

  approveRequest(id: string) {
    this.messages.update(msgs => 
      msgs.map(m => m.id === id ? { ...m, status: 'approved' } : m)
    );
    this.saveToStorage();
  }

  rejectRequest(id: string) {
    this.messages.update(msgs => 
      msgs.map(m => m.id === id ? { ...m, status: 'rejected' } : m)
    );
    this.saveToStorage();
  }

  get pendingCount() {
    return this.messages().filter(m => m.status === 'pending').length;
  }
}
