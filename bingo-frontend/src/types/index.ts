// Export all types
export * from './user';
export * from './game';
export * from './wallet';
export * from './websocket';
export * from './api';

// Sound Events
export enum SoundEvent {
  NUMBER_DRAW = 'number_draw',
  BUY_CARD = 'buy_card',
  NEAR_BINGO = 'near_bingo',
  BINGO = 'bingo',
  WIN = 'win',
  LOSE = 'lose',
}

// Chat Message
export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
}
