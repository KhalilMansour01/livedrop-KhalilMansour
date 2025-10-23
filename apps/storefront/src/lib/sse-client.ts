// Server-Sent Events client for real-time order tracking

export interface OrderStatusUpdate {
  orderId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  carrier?: string;
  estimatedDelivery?: string;
  timestamp: string;
  message: string;
  previousStatus?: string;
}

export interface SSEConnection {
  eventSource: EventSource;
  onUpdate: (update: OrderStatusUpdate) => void;
  onError: (error: Event) => void;
  onComplete: () => void;
  isConnected: boolean;
}

export class SSEClient {
  private connections = new Map<string, SSEConnection>();

  // Connect to order status stream
  connectToOrderStatus(
    orderId: string,
    onUpdate: (update: OrderStatusUpdate) => void,
    onError?: (error: Event) => void,
    onComplete?: () => void
  ): SSEConnection {
    const API_BASE_URL = 
    // (import.meta as any).env.VITE_API_URL || 
    'http://localhost:4000';
    const url = `${API_BASE_URL}/api/orders/${orderId}/stream`;

    const eventSource = new EventSource(url);
    
    const connection: SSEConnection = {
      eventSource,
      onUpdate,
      onError: onError || (() => {}),
      onComplete: onComplete || (() => {}),
      isConnected: true
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          console.error('SSE Error:', data.error);
          connection.onError(new Error(data.error) as any);
          return;
        }

        if (data.type === 'complete') {
          connection.onComplete();
          this.disconnect(orderId);
          return;
        }

        // Handle status updates
        const update: OrderStatusUpdate = {
          orderId: data.orderId,
          status: data.status,
          carrier: data.carrier,
          estimatedDelivery: data.estimatedDelivery,
          timestamp: data.timestamp,
          message: data.message,
          previousStatus: data.previousStatus
        };

        connection.onUpdate(update);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
        connection.onError(error as any);
      }
    };

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error('SSE Connection error:', error);
      connection.isConnected = false;
      connection.onError(error);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (this.connections.has(orderId)) {
          console.log('Attempting to reconnect to SSE...');
          this.disconnect(orderId);
          this.connectToOrderStatus(orderId, onUpdate, onError, onComplete);
        }
      }, 3000);
    };

    // Handle connection open
    eventSource.onopen = () => {
      console.log(`SSE connection opened for order ${orderId}`);
      connection.isConnected = true;
    };

    this.connections.set(orderId, connection);
    return connection;
  }

  // Disconnect from order status stream
  disconnect(orderId: string): void {
    const connection = this.connections.get(orderId);
    if (connection) {
      connection.eventSource.close();
      connection.isConnected = false;
      this.connections.delete(orderId);
      console.log(`SSE connection closed for order ${orderId}`);
    }
  }

  // Check if connected to a specific order
  isConnected(orderId: string): boolean {
    const connection = this.connections.get(orderId);
    return connection ? connection.isConnected : false;
  }

  // Get all active connections
  getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  // Disconnect all connections
  disconnectAll(): void {
    this.connections.forEach((connection, orderId) => {
      this.disconnect(orderId);
    });
  }

  // Get connection status
  getConnectionStatus(orderId: string): {
    isConnected: boolean;
    readyState: number;
  } {
    const connection = this.connections.get(orderId);
    if (!connection) {
      return { isConnected: false, readyState: EventSource.CLOSED };
    }

    return {
      isConnected: connection.isConnected,
      readyState: connection.eventSource.readyState
    };
  }
}

// Singleton instance
export const sseClient = new SSEClient();
