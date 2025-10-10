"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  MessageCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { TaskerApplication, ApplicationStatus } from "@/types/application";

interface ApplicationsTableProps {
  applications: TaskerApplication[];
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string, reason?: string) => void;
}

export default function ApplicationsTable({
  applications,
  onApproveApplication,
  onRejectApplication,
}: ApplicationsTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (applicationId: string) => {
    setActiveDropdown(activeDropdown === applicationId ? null : applicationId);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
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

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No applications found
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
              Applicant Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
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
          {applications.map((application) => (
            <tr
              key={application._id}
              className={`
                hover:bg-gray-50/50 transition-colors
                ${application.status === "approved" ? "bg-green-50/30" : ""}
                ${application.status === "rejected" ? "bg-red-50/30" : ""}
              `}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Image
                  src={
                    application.user.avatar_url ||
                    "/assets/images/users/default-avatar.jpg"
                  }
                  alt={application.user.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {application.user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {application.user.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.user.phone}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.category}
                </div>
                <div className="text-xs text-gray-500">
                  {application.experience}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(application.appliedAt)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.reviewedAt
                    ? formatDate(application.reviewedAt)
                    : "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(application.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* Quick Actions for Pending Applications */}
                  {application.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApproveApplication(application._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectApplication(application._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </button>
                    </>
                  )}

                  {/* View Details Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(application._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>

                    {activeDropdown === application._id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <Link
                            href={`/applications/${application._id}`}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>

                          {application.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  onApproveApplication(application._id)
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Application
                              </button>
                              <button
                                onClick={() =>
                                  onRejectApplication(application._id)
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Application
                              </button>
                            </>
                          )}

                          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Applicant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
