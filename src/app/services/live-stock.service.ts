import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { API_URL } from '../core/api.config';

export interface StockUpdate {
  productId: number;
  reduction: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiveStockService {
  private hubConnection?: HubConnection;
  private platformId = inject(PLATFORM_ID);
  
  // Signal to hold the latest stock updates
  // key: "type-productId", value: cumulative reduction
  stockUpdates = signal<Record<string, number>>({});

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initHub();
    }
  }

  private initHub() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${API_URL.replace('/api', '')}/stockHub`)
      .withAutomaticReconnect()
      .build();

    this.startConnection();

    this.hubConnection.on('ReceiveStockUpdate', (productId: number, reduction: number, type: string) => {
      const compositeKey = `${type?.toLowerCase()}-${productId}`;
      console.log(`[LIVE STOCK] ${compositeKey} reduced by ${reduction}`);
      this.stockUpdates.update(prev => ({
        ...prev,
        [compositeKey]: (prev[compositeKey] || 0) - reduction
      }));
    });

    this.hubConnection.on('ReceiveAbsoluteStock', (productId: number, newQuantity: number, type: string) => {
      const compositeKey = `${type?.toLowerCase()}-${productId}`;
      console.log(`[LIVE STOCK] ${compositeKey} set to ${newQuantity}`);
      this.stockUpdates.update(prev => {
        const updated = { ...prev };
        delete updated[compositeKey]; 
        return updated;
      });
    });

    this.hubConnection.on('ReceiveRefresh', () => {
      console.log('[LIVE STOCK] Global refresh requested.');
      window.location.reload(); 
    });
  }

  private async startConnection() {
    if (!this.hubConnection) return;
    try {
      await this.hubConnection.start();
      console.log('[SIGNALR] Connected to StockHub');
    } catch (err) {
      console.error('[SIGNALR] Error connecting to StockHub:', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }
}
