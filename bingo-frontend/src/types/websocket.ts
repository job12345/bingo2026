// WebSocket Types
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

// Client → Server Events
export interface JoinRoomEvent {
  roomId: string;
}

export interface LeaveRoomEvent {
  roomId: string;
}

export interface SendMessageEvent {
  roomId: string;
  content: string;
}

// Server → Client Events
export interface PlayerJoinedEvent {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface PlayerLeftEvent {
  userId: string;
}

export interface RoomStateChangedEvent {
  state: string;
  countdown?: number;
}

export interface GameStartedEvent {
  gameId: string;
  roundNumber: number;
  state: string;
}

export interface NumberDrawnEvent {
  number: number;
  totalDrawn: number;
  drawnNumbers: number[];
  timestamp: string;
}

export interface BingoClaimedEvent {
  userId: string;
  displayName: string;
  cardId: string;
  pattern: string;
  isValid: boolean;
  rank: number;
}

export interface GameEndedEvent {
  winnerId: string;
  winnerName: string;
  pattern: string;
  payoutAmount: number;
  ballsToWin: number;
}

export interface PayoutCompletedEvent {
  winnerId: string;
  amount: number;
  newBalance: number;
}

export interface NewMessageEvent {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
}

export type WebSocketEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | RoomStateChangedEvent
  | GameStartedEvent
  | NumberDrawnEvent
  | BingoClaimedEvent
  | GameEndedEvent
  | PayoutCompletedEvent
  | NewMessageEvent;
