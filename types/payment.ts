// types/payment.ts

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type PaymentMethod = "mpesa" | "bank" | "wallet";
export type PaymentType = "deposit" | "withdrawal" | "payment" | "refund";

export interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    avatar_url?: string;
  };
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  reference?: string;
  phone_number?: string;
  description?: string;
  related_request?: {
    _id: string;
    requestNumber: string;
    description: string;
  };
  mpesa_response?: {
    merchant_request_id: string;
    checkout_request_id: string;
    response_code: string;
    response_description: string;
    customer_message: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalBalance: number;
  paidToday: number;
  paidThisWeek: number;
  paidThisMonth: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  cancelledPayments: number;
}
