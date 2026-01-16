import { create } from 'zustand';
import { Transaction, WalletSummary } from '@/types';
import { WalletService } from '@/services';

/**
 * Wallet Store State
 */
interface WalletState {
  // State
  balance: number;
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  summary: WalletSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number, limit?: number) => Promise<void>;
  fetchPendingTransactions: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  requestDeposit: (amount: number, paymentSlipUrl: string, notes?: string) => Promise<void>;
  requestWithdraw: (amount: number, notes?: string) => Promise<void>;
  cancelTransaction: (transactionId: string) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  clearError: () => void;
}

/**
 * Wallet Store
 */
export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial State
  balance: 0,
  transactions: [],
  pendingTransactions: [],
  summary: null,
  isLoading: false,
  error: null,

  // Fetch Balance
  fetchBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const { balance } = await WalletService.getBalance();
      set({ balance, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch Transactions
  fetchTransactions: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await WalletService.getTransactions(page, limit) as any;
      // Handle various response structures (backend uses 'transactions', types use 'data')
      const list = response.transactions || response.data || response.items || [];
      set({ transactions: list, isLoading: false });
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch Pending Transactions
  fetchPendingTransactions: async () => {
    try {
      set({ isLoading: true, error: null });
      const pending = await WalletService.getPendingTransactions();
      set({ pendingTransactions: pending, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch Summary
  fetchSummary: async () => {
    try {
      set({ isLoading: true, error: null });
      const summary = await WalletService.getWalletSummary();
      set({ summary, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Request Deposit
  requestDeposit: async (amount, paymentSlipUrl, notes) => {
    try {
      set({ isLoading: true, error: null });
      const { transaction } = await WalletService.requestDeposit({ amount, paymentSlipUrl, notes });
      set((state) => ({
        pendingTransactions: [...state.pendingTransactions, transaction],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Request Withdraw
  requestWithdraw: async (amount, notes) => {
    try {
      set({ isLoading: true, error: null });
      const { transaction } = await WalletService.requestWithdraw({ amount, notes });
      set((state) => ({
        pendingTransactions: [...state.pendingTransactions, transaction],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Cancel Transaction
  cancelTransaction: async (transactionId) => {
    try {
      set({ isLoading: true, error: null });
      await WalletService.cancelTransaction(transactionId);
      set((state) => ({
        pendingTransactions: state.pendingTransactions.filter((t) => t.id !== transactionId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update Balance (from WebSocket)
  updateBalance: (newBalance) => {
    set({ balance: newBalance });
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },
}));
