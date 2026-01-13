import { create } from 'zustand';
import { ConnectionState, ChatMessage } from '@/types';
import { websocketService } from '@/services';

/**
 * WebSocket Store State
 */
interface WebSocketState {
  // State
  connectionState: ConnectionState;
  isConnected: boolean;
  messages: ChatMessage[];
  error: string | null;

  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  addMessage: (message: ChatMessage) => void;
  setConnectionState: (state: ConnectionState) => void;
  clearMessages: () => void;
}

/**
 * WebSocket Store
 */
export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // Initial State
  connectionState: 'disconnected',
  isConnected: false,
  messages: [],
  error: null,

  // Connect
  connect: (token) => {
    websocketService.connect(token);

    // Listen to connection state changes
    websocketService.on<ConnectionState>('connection_state_changed', (state) => {
      set({ connectionState: state, isConnected: state === 'connected' });
    });

    // Listen to new messages
    websocketService.on<ChatMessage>('new_message', (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    // Listen to errors
    websocketService.on<{ message: string }>('error', (data) => {
      set({ error: data.message });
    });
  },

  // Disconnect
  disconnect: () => {
    websocketService.disconnect();
    set({ connectionState: 'disconnected', isConnected: false });
  },

  // Join Room
  joinRoom: (roomId) => {
    websocketService.joinRoom(roomId);
  },

  // Leave Room
  leaveRoom: (roomId) => {
    websocketService.leaveRoom(roomId);
  },

  // Send Message
  sendMessage: (roomId, content) => {
    websocketService.sendMessage(roomId, content);
  },

  // Add Message
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Set Connection State
  setConnectionState: (state) => {
    set({ connectionState: state, isConnected: state === 'connected' });
  },

  // Clear Messages
  clearMessages: () => {
    set({ messages: [] });
  },
}));
