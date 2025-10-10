// types/tasker.ts
export type TaskerStatus = "approved" | "suspended";
export type VerificationStatus = "Verified" | "Pending" | "Unverified";

export interface TaskerReview {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
  client: string;
}

export interface Tasker {
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

  // Tasker specific fields
  isTasker: boolean;
  tasker_application_status: string;
  verification_level1_status: VerificationStatus;
  verification_level2_status: VerificationStatus;
  verification_level3_status: VerificationStatus;
  verification_level4_status: VerificationStatus;
  verification_level5_status: VerificationStatus;

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
  tasker_average_rating: number;
  tasker_complete_tasks: number;

  // Task statistics
  pendingTasks: number;
  inNegotiation: number;
  ongoingTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  expiredTasks: number;

  // Reviews
  reviews: TaskerReview[];

  // Dates
  appliedAt: string;
  updatedAt: string;
}

export interface TaskerStats {
  totalTaskers: number;
  activeTaskers: number;
  suspendedTaskers: number;
  newTaskersToday: number;
  averageRating: number;
  verifiedTaskers: number;
  pendingVerification: number;
}
