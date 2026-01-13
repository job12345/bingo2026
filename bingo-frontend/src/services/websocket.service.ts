import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ConnectionState,
  NumberDrawnEvent,
  BingoClaimedEvent,
  GameEndedEvent,
  PayoutCompletedEvent,
  ChatMessage,
} from '@/types';

/**
 * WebSocket Service
 */
class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  /**
   * เชื่อมต่อ WebSocket
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.warn('⚠️ WebSocket already connected');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8002';

    this.socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Number(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5,
      reconnectionDelay: Number(import.meta.env.VITE_WS_RECONNECT_DELAY) || 3000,
    });

    this.setupEventHandlers();
  }

  /**
   * ตั้งค่า Event Handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection Events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket Connected');
      this.connectionState = 'connected';
      this.emit('connection_state_changed', 'connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket Disconnected:', reason);
      this.connectionState = 'disconnected';
      this.emit('connection_state_changed', 'disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 WebSocket Connection Error:', error);
      this.connectionState = 'error';
      this.emit('connection_state_changed', 'error');
    });

    // Authentication
    this.socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('authentication_failed', (data) => {
      console.error('❌ Authentication Failed:', data);
      this.emit('authentication_failed', data);
    });

    // Room Events
    this.socket.on('player_joined', (data) => {
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data) => {
      this.emit('player_left', data);
    });

    this.socket.on('room_state_changed', (data) => {
      this.emit('room_state_changed', data);
    });

    // Game Events
    this.socket.on('game_started', (data) => {
      this.emit('game_started', data);
    });

    this.socket.on('number_drawn', (data) => {
      this.emit('number_drawn', data);
    });

    this.socket.on('bingo_claimed', (data) => {
      this.emit('bingo_claimed', data);
    });

    this.socket.on('game_ended', (data) => {
      this.emit('game_ended', data);
    });

    this.socket.on('payout_completed', (data) => {
      this.emit('payout_completed', data);
    });

    // Chat Events
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    // Error Events
    this.socket.on('error', (data) => {
      this.emit('error', data);
    });
  }

  /**
   * ยกเลิกการเชื่อมต่อ
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionState = 'disconnected';
    }
  }

  /**
   * เข้าร่วมห้อง
   */
  joinRoom(roomId: string): void {
    this.socket?.emit('join_room', { roomId });
  }

  /**
   * ออกจากห้อง
   */
  leaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', { roomId });
  }

  /**
   * ส่งข้อความ
   */
  sendMessage(roomId: string, content: string): void {
    this.socket?.emit('send_message', { roomId, content });
  }

  /**
   * Register Event Listener
   */
  on<T = any>(event: string, callback: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unregister Event Listener
   */
  off<T = any>(event: string, callback: (data: T) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit Event to Listeners
   */
  private emit<T = any>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  /**
   * ดูสถานะการเชื่อมต่อ
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * ตรวจสอบว่าเชื่อมต่ออยู่หรือไม่
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();
