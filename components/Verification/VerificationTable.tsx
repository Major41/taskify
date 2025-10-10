"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  Users,
  Shield,
} from "lucide-react";
import {
  VerificationRequest,
  VerificationStatus,
  VerificationStage,
} from "@/types/verification";
import VerificationDetails from "./VerificationDetails";

interface VerificationTableProps {
  verifications: VerificationRequest[];
  onStageApproval: (verificationId: string, stage: VerificationStage) => void;
  onStageRejection: (
    verificationId: string,
    stage: VerificationStage,
    reason: string
  ) => void;
  onFinalVerification: (
    verificationId: string,
    approve: boolean,
    reason?: string
  ) => void;
}

export default function VerificationTable({
  verifications,
  onStageApproval,
  onStageRejection,
  onFinalVerification,
}: VerificationTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (verificationId: string) => {
    setActiveDropdown(
      activeDropdown === verificationId ? null : verificationId
    );
  };

  const toggleRowExpansion = (verificationId: string) => {
    setExpandedRow(expandedRow === verificationId ? null : verificationId);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getDateApproved = (verification: VerificationRequest) => {
    if (
      verification.overallStatus === "approved" &&
      verification.stages.final.reviewedAt
    ) {
      return formatDate(verification.stages.final.reviewedAt);
    }
    return verification.overallStatus === "pending" ? "Pending" : "N/A";
  };

  const handleStageAction = async (
    verificationId: string,
    stage: VerificationStage,
    approve: boolean
  ) => {
    if (approve) {
      await onStageApproval(verificationId, stage);
    } else {
      const reason = prompt(`Please provide a reason for rejecting ${stage}:`);
      if (reason) {
        await onStageRejection(verificationId, stage, reason);
      }
    }
  };

  const handleFinalAction = async (
    verificationId: string,
    approve: boolean
  ) => {
    if (approve) {
      await onFinalVerification(verificationId, true);
    } else {
      const reason = prompt(
        "Please provide a reason for rejecting final verification:"
      );
      if (reason) {
        await onFinalVerification(verificationId, false, reason);
      }
    }
  };

  if (verifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No verification requests found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/80 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasker Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date of Application
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Approved
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {verifications.map((verification) => (
            <>
              <tr
                key={verification._id}
                className={`
                  hover:bg-gray-50/50 transition-colors cursor-pointer
                  ${
                    verification.overallStatus === "approved"
                      ? "bg-green-50/30"
                      : ""
                  }
                  ${
                    verification.overallStatus === "rejected"
                      ? "bg-red-50/30"
                      : ""
                  }
                `}
                onClick={() => toggleRowExpansion(verification._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={
                      verification.tasker.avatar_url ||
                      "/assets/images/users/default-avatar.jpg"
                    }
                    alt={verification.tasker.name}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {verification.tasker.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {verification.tasker.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(verification.appliedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getDateApproved(verification)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(verification.overallStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {verification.overallStatus === "pending" ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinalAction(verification._id, true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinalAction(verification._id, false);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No action needed
                    </span>
                  )}
                </td>
              </tr>

              {/* Expanded Details Row */}
              {expandedRow === verification._id && (
                <tr className="bg-gray-50/50">
                  <td colSpan={7} className="px-6 py-4">
                    <VerificationDetails
                      verification={verification}
                      onStageApproval={onStageApproval}
                      onStageRejection={onStageRejection}
                      onFinalVerification={onFinalVerification}
                    />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
