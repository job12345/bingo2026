// User Types
export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
  BOT = 'BOT',
}

export interface User {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  pointBalance: number;
  
  // Bank Info
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  
  // Statistics
  totalGamesPlayed: number;
  totalWins: number;
  totalSpent: number;
  totalWon: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Status
  isBanned: boolean;
  bannedUntil?: string;
  bannedReason?: string;
}

export interface UserProfile extends User {}

export interface UserStatistics {
  totalGamesPlayed: number;
  totalWins: number;
  winRate: number;
  netProfit: number;
  avgBingoReactionTimeMs?: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalWins: number;
  totalWon: number;
  winRate: number;
}
