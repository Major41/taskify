// types/verification.ts
export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationStage = "stage3" | "stage4" | "final";
export type TaskStatus =
  | "in_negotiation"
  | "ongoing"
  | "completed"
  | "canceled";
export type PaymentStatus = "pending" | "completed" | "refunded";

export interface Tasker {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url?: string;
}

export interface Client {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

export interface RequestInfo {
  _id: string;
  description: string;
  budget: number;
  category: string;
}

export interface VerificationStageInfo {
  status: VerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface VerificationRequest {
  _id: string;
  tasker: Tasker;
  client: Client;
  request: RequestInfo;
  agreed_amount: number;
  task_status: TaskStatus;
  payment_status: PaymentStatus;
  completion_date?: string;
  cancellation_reason?: string;
  client_rating?: number;
  tasker_rating?: number;
  client_review?: string;
  tasker_review?: string;
  overallStatus: VerificationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface VerificationStats {
  totalVerifications: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
  inNegotiation: number;
  ongoing: number;
  completed: number;
  canceled: number;
}
