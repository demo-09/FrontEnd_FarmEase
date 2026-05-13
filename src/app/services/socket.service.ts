import * as signalR from '@microsoft/signalr';
import { HUB_URL } from '../core/api.config';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private hub!: signalR.HubConnection;

  messages = signal<any[]>([]);
  connectionStatus = signal<'Connected' | 'Disconnected' | 'Connecting'>('Disconnected');

  start() {
    if (this.hub?.state === signalR.HubConnectionState.Connected) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    // HANDLERS: Check these names against your Backend hub
    this.hub.on('ReceiveMessage', (msg: any) => {
      this.messages.update(prev => [...prev, msg]);
    });

    this.hub.onreconnecting(() => this.connectionStatus.set('Connecting'));
    this.hub.onreconnected(() => this.connectionStatus.set('Connected'));

    this.startConnection();
  }

  private async startConnection() {
    try {
      await this.hub.start();
      this.connectionStatus.set('Connected');
    } catch (err) {
      console.error('SignalR Start Error:', err);
      setTimeout(() => this.start(), 5000);
    }
  }

  async joinConversation(otherEmail: string) {
    if (this.hub?.state === signalR.HubConnectionState.Connected) {
      await this.hub.invoke('JoinConversation', otherEmail).catch(console.error);
    }
  }

  async sendMessage(receiverEmail: string, content: string) {
    return this.hub.invoke('SendMessage', { content, receiverEmail });
  }

  stop() {
    if (this.hub) this.hub.stop();
  }
}
