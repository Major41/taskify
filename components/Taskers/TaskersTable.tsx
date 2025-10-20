// components/Taskers/TaskersTable.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Tasker } from "@/types/tasker";
import TaskerDetails from "./TaskerDetails";
import SuspendModal from "./SuspendModal";

interface TaskersTableProps {
  taskers: Tasker[];
  onSuspendTasker: (taskerId: string, reason: string) => void;
  onReinstateTasker: (taskerId: string) => void;
  onSendMessage: (taskerId: string, message: string) => Promise<boolean>;
}

export default function TaskersTable({
  taskers,
  onSuspendTasker,
  onReinstateTasker,
  onSendMessage,
}: TaskersTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedTasker, setSelectedTasker] = useState<Tasker | null>(null);

  console.log("Rendering TaskersTable with taskers:", taskers);

  const toggleDropdown = (taskerId: string) => {
    setActiveDropdown(activeDropdown === taskerId ? null : taskerId);
  };

  const toggleRowExpansion = (taskerId: string) => {
    setExpandedRow(expandedRow === taskerId ? null : taskerId);
  };

  const getStatusBadge = (tasker: Tasker) => {
    const isActive = tasker.is_approved && tasker.is_accepting_requests;

    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Suspended
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getDateApproved = (tasker: Tasker) => {
    if (tasker.is_approved) {
      return tasker.updatedAt ? formatDate(tasker.updatedAt) : "Approved";
    }
    return "Not Approved";
  };

  const handleSuspendClick = (tasker: Tasker) => {
    setSelectedTasker(tasker);
    setShowSuspendModal(true);
  };

  const handleSuspendConfirm = async (reason: string) => {
    if (selectedTasker) {
      await onSuspendTasker(selectedTasker._id, reason);
      setShowSuspendModal(false);
      setSelectedTasker(null);
    }
  };

  const handleReinstate = async (taskerId: string) => {
    if (confirm("Are you sure you want to reinstate this tasker?")) {
      await onReinstateTasker(taskerId);
    }
  };

  if (taskers.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No taskers found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
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
            {taskers.map((tasker) => (
              <>
                <tr
                  key={tasker._id}
                  className={`
                    hover:bg-gray-50/50 transition-colors cursor-pointer
                    ${
                      tasker.is_approved && tasker.is_accepting_requests
                        ? "bg-green-50/30"
                        : "bg-red-50/30"
                    }
                  `}
                  onClick={() => toggleRowExpansion(tasker._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-14 h-14">
                      <Image
                        src={
                          tasker.profile_picture ||
                          "/assets/images/users/default-avatar.jpg"
                        }
                        alt={tasker.name}
                        fill
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "/assets/images/users/default-avatar.jpg";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tasker.name}
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {tasker.tasker_average_rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tasker.phone}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {tasker.isPhone_number_verified
                        ? "Verified"
                        : "Unverified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(tasker.appliedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDateApproved(tasker)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tasker)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2 min-w-[120px]">
                      {tasker.is_approved && tasker.is_accepting_requests ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuspendClick(tasker);
                          }}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReinstate(tasker._id);
                          }}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedRow === tasker._id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={7} className="px-6 py-4">
                      <TaskerDetails
                        tasker={tasker}
                        onSendMessage={onSendMessage}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedTasker(null);
        }}
        onConfirm={handleSuspendConfirm}
        taskerName={selectedTasker?.name || ""}
      />
    </>
  );
}
