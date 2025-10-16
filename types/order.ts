// types/order.ts
export const OrderStatus = {
  PENDING: "Pending",
  NEGOTIATION: "In Negotiation",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

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
