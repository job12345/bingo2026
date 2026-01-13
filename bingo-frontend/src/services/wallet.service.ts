import { apiClient } from './api';
import { Transaction, WalletSummary, DepositRequest, WithdrawRequest, PaginatedResponse } from '@/types';

/**
 * Wallet Service
 */
export class WalletService {
  /**
   * ดูยอดเงิน Point ปัจจุบัน
   */
  static async getBalance(): Promise<{ balance: number }> {
    return apiClient.get('/wallet/balance');
  }

  /**
   * ดูประวัติธุรกรรม
   */
  static async getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get('/wallet/transactions', { page, limit });
  }

  /**
   * ขอเติมเงิน (Deposit Request)
   */
  static async requestDeposit(data: DepositRequest): Promise<{ message: string; transaction: Transaction }> {
    return apiClient.post('/wallet/deposit', data);
  }

  /**
   * ขอถอนเงิน (Withdraw Request)
   */
  static async requestWithdraw(data: WithdrawRequest): Promise<{ message: string; transaction: Transaction }> {
    return apiClient.post('/wallet/withdraw', data);
  }

  /**
   * ดูรายการรอ Admin อนุมัติ
   */
  static async getPendingTransactions(): Promise<Transaction[]> {
    return apiClient.get('/wallet/pending');
  }

  /**
   * ยกเลิกคำขอ (เฉพาะ Pending)
   */
  static async cancelTransaction(transactionId: string): Promise<void> {
    return apiClient.post(`/wallet/cancel/${transactionId}`);
  }

  /**
   * ดูสรุปการเงิน
   */
  static async getWalletSummary(): Promise<WalletSummary> {
    return apiClient.get('/wallet/summary');
  }

  /**
   * อัปโหลดสลิปการโอนเงิน
   */
  static async uploadPaymentSlip(file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> {
    return apiClient.uploadFile('/wallet/upload-slip', file, onProgress);
  }
}
