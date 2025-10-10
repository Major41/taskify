// types/client.ts
export type ClientStatus = "active" | "suspended";

export interface ClientReview {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
  tasker: string;
}

export interface Client {
  _id: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  avatar_url?: string;
  address: string;
  gender: string;
  isPhone_number_verified: boolean;
  verified_identity_url?: string;
  client_average_rating: number;
  client_complete_tasks: number;
  isTasker: boolean;

  // Financial fields
  walletBalance: number;
  walletId: string;
  withdrawStatus: string;
  referralId: string;
  referrerId: string;

  // Location
  latitude: number;
  longitude: number;

  // Status fields for UI
  is_approved: boolean;
  is_accepting_requests: boolean;

  // Task statistics
  pendingTasks: number;
  inNegotiation: number;
  ongoingTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  expiredTasks: number;

  // Reviews
  reviews: ClientReview[];

  // Dates
  appliedAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  newClientsToday: number;
  averageRating: number;
  clientsWithCompletedTasks: number;
}
