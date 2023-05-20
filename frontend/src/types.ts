export type TransactionType = 'credit' | 'debit' | 'refund';

export type TransactionStatus = 'completed' | 'pending';

export type HistoryDuration =
  | 'all-time'
  | 'last 7 days'
  | 'last 14 days'
  | 'last 30 days'
  | 'last 3 months';

export type PaymentType = 'refund' | 'purchase' | 'withdrawal' | 'account top-up';

export type PaymentResponseMessage = 'Transaction Completed' | 'Transaction Failed';
