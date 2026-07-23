export type CompanyRole = "admin" | "recruiter";
export type CompanyMembershipStatus = "active" | "left" | "removed";
export type CompanyVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface CompanyMemberPermissions {
  viewAllJobs: boolean;
  manageAllJobs: boolean;
  viewAllApplicants: boolean;
  manageAllApplicants: boolean;
  viewAllConversations: boolean;
  manageAllConversations: boolean;
  viewCompanyAnalytics: boolean;
}

export interface EmployerContext {
  userId: string;
  companyId: string;
  membershipId: string;
  role: CompanyRole;
  isOwner: boolean;
  companyName: string;
  companyLogoUrl: string | null;
  verificationStatus: CompanyVerificationStatus;
  permissions: CompanyMemberPermissions;
}

export interface CompanyMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: CompanyRole;
  status: CompanyMembershipStatus;
  isOwner: boolean;
  joinedAt: string;
  permissions: CompanyMemberPermissions;
}

export interface CompanyInvitation {
  id: string;
  email: string;
  role: CompanyRole;
  status: string;
  expiresAt: string;
  deliveryError: string | null;
  createdAt: string;
}

export interface AffiliationRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  targetEmailMasked: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}
