import { Injectable, signal } from '@angular/core';

export interface InboxMessage {
  id: string;
  type: 'rental' | 'bulk_order' | 'product_approval' | 'user_alert';
  title: string;
  requester: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminInboxService {
  // Global reactive state holds all incoming admin approvals
  messages = signal<InboxMessage[]>([]);

  constructor() {
    // Add some initial mock messages to show off the system immediately
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
  }

  sendMessage(msg: Omit<InboxMessage, 'id' | 'timestamp' | 'status'>) {
    const newMsg: InboxMessage = {
      ...msg,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date(),
      status: 'pending'
    };

    // Prepend to array
    this.messages.update(msgs => [newMsg, ...msgs]);
  }

  approveRequest(id: string) {
    this.messages.update(msgs => 
      msgs.map(m => m.id === id ? { ...m, status: 'approved' } : m)
    );
  }

  rejectRequest(id: string) {
    this.messages.update(msgs => 
      msgs.map(m => m.id === id ? { ...m, status: 'rejected' } : m)
    );
  }

  get pendingCount() {
    return this.messages().filter(m => m.status === 'pending').length;
  }
}
