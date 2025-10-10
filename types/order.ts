export type OrderStatus =
  | "pending"
  | "negotiation"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "expired";

export interface Order {
  _id: string;
  requestNumber: string;
  taskerName: string;
  taskerProfileImage?: string;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  category?: string;
  deadline?: string;
}
