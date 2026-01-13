import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Game, BingoCard, RoomPlayer, BingoPattern } from '@/types';
import { GameService } from '@/services';

/**
 * Game Store State
 */
interface GameState {
  // Current Game
  currentGame: Game | null;
  myCards: BingoCard[];
  players: RoomPlayer[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedCardId: string | null;

  // Actions
  setCurrentGame: (game: Game | null) => void;
  updateGameState: (updates: Partial<Game>) => void;
  setMyCards: (cards: BingoCard[]) => void;
  addCard: (card: BingoCard) => void;
  setPlayers: (players: RoomPlayer[]) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (userId: string) => void;

  // Game Actions
  buyCards: (gameId: string, quantity: number) => Promise<void>;
  claimBingo: (gameId: string, cardId: string, pattern: BingoPattern) => Promise<boolean>;
  markNumber: (cardId: string, number: number) => void;

  // Card Selection
  selectCard: (cardId: string | null) => void;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

/**
 * Game Store (with Immer)
 */
export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    // Initial State
    currentGame: null,
    myCards: [],
    players: [],
    isLoading: false,
    error: null,
    selectedCardId: null,

    // Set Current Game
    setCurrentGame: (game) => {
      set({ currentGame: game });
    },

    // Update Game State
    updateGameState: (updates) => {
      set((state) => {
        if (state.currentGame) {
          state.currentGame = { ...state.currentGame, ...updates };
        }
      });
    },

    // Set My Cards
    setMyCards: (cards) => {
      set({ myCards: cards });
    },

    // Add Card
    addCard: (card) => {
      set((state) => {
        state.myCards.push(card);
      });
    },

    // Set Players
    setPlayers: (players) => {
      set({ players });
    },

    // Add Player
    addPlayer: (player) => {
      set((state) => {
        const exists = state.players.find((p) => p.userId === player.userId);
        if (!exists) {
          state.players.push(player);
        }
      });
    },

    // Remove Player
    removePlayer: (userId) => {
      set((state) => {
        state.players = state.players.filter((p) => p.userId !== userId);
      });
    },

    // Buy Cards
    buyCards: async (gameId, quantity) => {
      try {
        set({ isLoading: true, error: null });
        const { cards } = await GameService.buyCards(gameId, quantity);
        set((state) => {
          state.myCards.push(...cards);
          state.isLoading = false;
        });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Claim Bingo
    claimBingo: async (gameId, cardId, pattern) => {
      try {
        set({ isLoading: true, error: null });
        const result = await GameService.claimBingo(gameId, cardId, pattern);
        set({ isLoading: false });
        return result.isValid;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        return false;
      }
    },

    // Mark Number on Card
    markNumber: (cardId, number) => {
      set((state) => {
        const card = state.myCards.find((c) => c.id === cardId);
        if (card && !card.markedNumbers.includes(number)) {
          card.markedNumbers.push(number);
        }
      });
    },

    // Select Card
    selectCard: (cardId) => {
      set({ selectedCardId: cardId });
    },

    // Clear Error
    clearError: () => {
      set({ error: null });
    },

    // Reset Store
    reset: () => {
      set({
        currentGame: null,
        myCards: [],
        players: [],
        isLoading: false,
        error: null,
        selectedCardId: null,
      });
    },
  }))
);
