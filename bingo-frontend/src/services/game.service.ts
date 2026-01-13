import { apiClient } from './api';
import { Game, BingoCard, BingoPattern } from '@/types';

/**
 * Game Service
 */
export class GameService {
  /**
   * เข้าร่วมห้อง (Sitting Phase)
   */
  static async joinRoom(roomId: string): Promise<void> {
    return apiClient.post(`/game/${roomId}/join`);
  }

  /**
   * ซื้อการ์ด (Buying Phase)
   */
  static async buyCards(gameId: string, quantity: number): Promise<{ cards: BingoCard[]; newBalance: number }> {
    return apiClient.post(`/game/${gameId}/buy-cards`, { quantity });
  }

  /**
   * กด Bingo (Claim Winner)
   */
  static async claimBingo(
    gameId: string,
    cardId: string,
    pattern: BingoPattern
  ): Promise<{ isValid: boolean; rank?: number }> {
    return apiClient.post(`/game/${gameId}/bingo`, { cardId, pattern });
  }

  /**
   * ดูสถานะเกมปัจจุบัน
   */
  static async getGameState(gameId: string): Promise<Game> {
    return apiClient.get(`/game/${gameId}`);
  }

  /**
   * ดูการ์ดของตัวเอง
   */
  static async getMyCards(gameId: string): Promise<BingoCard[]> {
    return apiClient.get(`/game/${gameId}/cards`);
  }
}
