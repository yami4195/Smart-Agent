import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = (): string => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

class SocketService {
  private socket: Socket | null = null;
  private currentBranchId: string | null = null;
  private currentUserId: string | null = null;

  public connect(): Socket {
    if (!this.socket) {
      const socketUrl = getSocketUrl();
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        // Re-join active rooms upon reconnection
        if (this.currentBranchId) {
          this.socket?.emit('join:branch', this.currentBranchId);
        }
        if (this.currentUserId) {
          this.socket?.emit('join:user', this.currentUserId);
        }
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  public joinBranch(branchId: string): void {
    if (!branchId) return;
    this.currentBranchId = branchId;
    const socket = this.connect();
    socket.emit('join:branch', branchId);
  }

  public leaveBranch(branchId: string): void {
    if (!branchId || !this.socket) return;
    this.socket.emit('leave:branch', branchId);
    if (this.currentBranchId === branchId) {
      this.currentBranchId = null;
    }
  }

  public joinUser(userId: string): void {
    if (!userId) return;
    this.currentUserId = userId;
    const socket = this.connect();
    socket.emit('join:user', userId);
  }

  public joinEmployee(employeeId: string): void {
    if (!employeeId) return;
    const socket = this.connect();
    socket.emit('join:employee', employeeId);
  }

  // --- Event Listeners with Cleanup Callbacks ---

  public onNewTicket(callback: (ticket: any) => void): () => void {
    const socket = this.connect();
    socket.on('queue:new_ticket', callback);
    return () => {
      socket.off('queue:new_ticket', callback);
    };
  }

  public onTicketUpdated(callback: (ticket: any) => void): () => void {
    const socket = this.connect();
    socket.on('queue:ticket_updated', callback);
    return () => {
      socket.off('queue:ticket_updated', callback);
    };
  }

  public onEmployeeNotification(callback: (notification: any) => void): () => void {
    const socket = this.connect();
    socket.on('employee:notification', callback);
    return () => {
      socket.off('employee:notification', callback);
    };
  }

  public onCustomerNotification(callback: (notification: any) => void): () => void {
    const socket = this.connect();
    socket.on('customer:notification', callback);
    return () => {
      socket.off('customer:notification', callback);
    };
  }

  public onQueueStatusChanged(callback: (payload: any) => void): () => void {
    const socket = this.connect();
    socket.on('queue:status_changed', callback);
    return () => {
      socket.off('queue:status_changed', callback);
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
export const socketService = new SocketService();
export default socketService;
