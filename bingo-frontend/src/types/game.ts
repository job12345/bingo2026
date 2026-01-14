// Game Types
export enum GameState {
  IDLE = 'IDLE',
  WAITING_FOR_ROUND = 'WAITING_FOR_ROUND',
  SITTING_PHASE = 'SITTING_PHASE',
  BUYING_PHASE = 'BUYING_PHASE',
  GAME_RUNNING = 'GAME_RUNNING',
  BINGO_RACE = 'BINGO_RACE',
  WINNER_DECLARED = 'WINNER_DECLARED',
  PAYOUT = 'PAYOUT',
  COOLDOWN = 'COOLDOWN',
}

export enum DrawMode {
  AUTO = 'auto',
  MANUAL_ROTATE = 'manual_rotate',
}

export enum BallSet {
  BALL_75 = 'BALL_75',
  BALL_90 = 'BALL_90',
}

export enum BingoPattern {
  HORIZONTAL_1 = 'horizontal_1',
  HORIZONTAL_2 = 'horizontal_2',
  HORIZONTAL_3 = 'horizontal_3',
  HORIZONTAL_4 = 'horizontal_4',
  HORIZONTAL_5 = 'horizontal_5',
  VERTICAL_1 = 'vertical_1',
  VERTICAL_2 = 'vertical_2',
  VERTICAL_3 = 'vertical_3',
  VERTICAL_4 = 'vertical_4',
  VERTICAL_5 = 'vertical_5',
  DIAGONAL_1 = 'diagonal_1',
  DIAGONAL_2 = 'diagonal_2',
  FOUR_CORNERS = 'four_corners',
}

export interface BingoCard {
  id: string;
  gameId: string;
  userId: string;
  numbers: number[][]; // 5x5 grid
  cardHash: string;
  purchasePrice: number;
  isWinner: boolean;
  winningPattern?: BingoPattern;
  createdAt: string;
}

export interface Game {
  id: string;
  roomId: string;
  roundNumber: number;
  state: GameState;
  
  // Drawing
  drawnNumbers: number[];
  currentBall?: number;
  totalBallsDrawn: number;
  
  // Pot
  potSize: number;
  feePercentage: number;
  feeAmount?: number;
  payoutAmount?: number;
  
  // Winner
  winnerId?: string;
  winningPattern?: BingoPattern;
  ballsToWin?: number;
  
  // Timestamps
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface RoomPlayer {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  cardCount: number;
  isReady: boolean;
}

export interface GameRoomState {
  game: Game;
  room: Room;
  players: RoomPlayer[];
  myCards: BingoCard[];
}

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  
  // Configuration
  drawMode: DrawMode;
  ballSet: BallSet;
  maxPlayers: number;
  maxRounds: number;
  cardPrice: number;
  maxCardsPerPlayer: number;
  feePercentage: number;
  
  // Status
  isActive: boolean;
  currentPlayers: number;
  currentRound: number;
  currentGameId?: string;
  
  // Statistics
  totalRoundsPlayed: number;
  totalPotCollected: number;
  totalFeeCollected: number;
  topWinnerId?: string;
  topWinnerAmount?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  drawMode: DrawMode;
  ballSet: BallSet;
  maxPlayers: number;
  maxRounds: number;
  cardPrice: number;
  maxCardsPerPlayer?: number;
  feePercentage?: number;
}

export interface BuyCardsDto {
  quantity: number;
}

export interface ClaimBingoDto {
  cardId: string;
  pattern: BingoPattern;
}
