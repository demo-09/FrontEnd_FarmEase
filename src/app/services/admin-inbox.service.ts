import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, timer, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface InboxMessage {
  id: string;
  type: 'rental' | 'bulk_order' | 'user_alert' | 'product_approval';
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
export class AdminInboxService implements OnDestroy {
  // Global reactive state holds all incoming admin approvals
  messages = signal<InboxMessage[]>([]);
  private pollingSub?: Subscription;

  private http = inject(HttpClient);
  private activityUrl = 'https://backend-farmease-1.onrender.com/api/activity';
  private ordersUrl = 'https://backend-farmease-1.onrender.com/api/orders';

  constructor() {
    this.loadFromStorage();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    // Poll every 30 seconds for new activities/orders
    this.pollingSub = timer(0, 30000).subscribe(() => {
      this.refreshInbox();
    });
  }

  private stopPolling() {
    this.pollingSub?.unsubscribe();
  }

  refreshInbox(): void {
    forkJoin({
      orders: this.http.get<any[]>(`${this.ordersUrl}/all`).pipe(catchError(() => of([]))),
      activities: this.http.get<any[]>(`${this.activityUrl}/all`).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const orderMsgs: InboxMessage[] = res.orders.map(o => {
          const isRental = o.items?.some((i: any) => 
            i.productName.toLowerCase().includes('tractor') || 
            i.productName.toLowerCase().includes('harvester') || 
            i.productName.toLowerCase().includes('machine')
          );
          
          return {
            id: `ORD-${o.id}`,
            type: (isRental ? 'rental' : 'bulk_order'),
            title: isRental ? 'Equipment Rental Request' : 'Bulk Product Order',
            requester: o.requesterName || o.requesterEmail || 'Unknown Requester',
            details: `Order of ₹${o.totalAmount} for ${o.items?.length || 0} item(s).`,
            timestamp: new Date(o.orderDate),
            status: (o.status?.toLowerCase() === 'completed' ? 'approved' : o.status?.toLowerCase()) as any
          };
        });
        
        const actMsgs: InboxMessage[] = res.activities.map(a => {
          return {
            id: `ACT-${a.id}`,
            type: 'user_alert',
            title: a.actionType === 'user_alert' ? 'System Activity' : a.actionType,
            requester: a.userFullName || 'System',
            details: a.details,
            timestamp: new Date(a.timestamp),
            status: 'approved' as any
          };
        });

        const mappedMsgs = [...orderMsgs, ...actMsgs];
        mappedMsgs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Only update if there are changes to avoid unnecessary re-renders
        if (JSON.stringify(mappedMsgs) !== JSON.stringify(this.messages())) {
          this.messages.set(mappedMsgs);
          this.saveToStorage();
        }
      },
      error: (err) => console.error('Failed to load inbox data', err)
    });
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
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem('admin_inbox_logs', JSON.stringify(this.messages()));
  }

  sendMessage(msg: Omit<InboxMessage, 'id' | 'timestamp' | 'status'> & { status?: InboxMessage['status'] }) {
    const newMsg: InboxMessage = {
      ...msg,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date(),
      status: msg.status || 'pending'
    };

    this.messages.update(msgs => [newMsg, ...msgs]);
    this.saveToStorage();
  }

  logActivity(actionType: string, details: string) {
    this.http.post(`${this.activityUrl}/log`, { actionType, details }).subscribe({
      next: () => this.refreshInbox(), // Refresh after logging
      error: (err) => console.error('Failed to log activity to backend', err)
    });

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
