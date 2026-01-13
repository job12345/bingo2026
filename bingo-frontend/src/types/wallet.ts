// Wallet Types
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  CARD_PURCHASE = 'card_purchase',
  PAYOUT = 'payout',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  
  // Balance Tracking
  balanceBefore: number;
  balanceAfter: number;
  
  // Payment Info (Deposit/Withdraw)
  paymentSlipUrl?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  
  // Metadata
  notes?: string;
  metadata?: Record<string, any>;
  
  // Admin
  approvedByUserId?: string;
  approvedAt?: string;
  rejectedReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WalletSummary {
  currentBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalSpent: number;
  totalWon: number;
  netProfit: number;
}

export interface DepositRequestDto {
  amount: number;
  paymentSlipUrl: string;
  notes?: string;
}

export interface WithdrawRequestDto {
  amount: number;
  notes?: string;
}

export interface ApproveTransactionDto {
  notes?: string;
}

export interface RejectTransactionDto {
  reason: string;
}
