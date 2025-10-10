export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface TaskerApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    avatar_url?: string;
  };
  about: string;
  skills: string[];
  idImages: {
    passport?: string;
    idFront: string;
    idBack: string;
  };
  workImages: string[];
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  category: string;
  experience: string;
  location: string;
  hourlyRate?: number;
}

export interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvalRate: number;
}
