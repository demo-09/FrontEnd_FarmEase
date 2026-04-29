import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  private http = inject(HttpClient);
  private backendUrl = 'https://backend-farmease-1.onrender.com/api/activity';

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

  logActivity(actionType: string, details: string) {
    // 1. Send to backend for persistence
    this.http.post(`${this.backendUrl}/log`, { actionType, details }).subscribe({
      error: (err) => console.error('Failed to log activity to backend', err)
    });

    // 2. Also send to local inbox for immediate UI feedback
    const userStr = localStorage.getItem('CurrentUser');
    const user = userStr ? JSON.parse(userStr) : null;

    this.sendMessage({
      type: 'user_alert',
      title: actionType,
      requester: user ? (user.fullName || user.email) : 'System',
      details: details,
      status: 'info'
    });
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
