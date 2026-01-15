"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Order } from "@/types/order";

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

interface OrderTimer {
  id: string;
  createdAt: number;
  timeLeft: number; // in milliseconds
  isExpired: boolean;
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [timers, setTimers] = useState<OrderTimer[]>([]);

  // Initialize timers when orders change
  useEffect(() => {
    const newTimers: OrderTimer[] = orders
      .filter((order) => order.status.toLowerCase() === "pending")
      .map((order) => {
        const createdAt = order.createdAt;
        const now = Date.now();
        const timePassed = now - createdAt;
        const timeLeft = 20 * 60 * 1000 - timePassed; // 20 minutes in milliseconds
        const isExpired = timeLeft <= 0;

        return {
          id: order.id,
          createdAt,
          timeLeft: Math.max(0, timeLeft),
          isExpired,
        };
      });

    setTimers(newTimers);
  }, [orders]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.isExpired) return timer;

          const newTimeLeft = timer.timeLeft - 1000;
          const isExpired = newTimeLeft <= 0;

          return {
            ...timer,
            timeLeft: Math.max(0, newTimeLeft),
            isExpired,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      accepted: { color: "bg-blue-100 text-blue-800", label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      expired: { color: "bg-gray-100 text-gray-800", label: "Expired" },
      in_progress: {
        color: "bg-purple-100 text-purple-800",
        label: "In Progress",
      },
      negotiation: {
        color: "bg-orange-100 text-orange-800",
        label: "Negotiation",
      },
      assigned: { color: "bg-indigo-100 text-indigo-800", label: "Assigned" },
      unassigned: { color: "bg-gray-100 text-gray-800", label: "Unassigned" },
    };

    const normalizedStatus = status?.toLowerCase() || "unknown";

    const config = statusConfig[normalizedStatus] || {
      color: "bg-gray-100 text-gray-800",
      label: status || "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimerForOrder = (orderId: string) => {
    return timers.find((timer) => timer.id === orderId);
  };

  const formatCountdown = (milliseconds: number) => {
    if (milliseconds <= 0) return "00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimerDisplay = (order: Order) => {
    // Only show timer for pending orders
    if (order.status.toLowerCase() !== "pending") {
      return <div className="text-sm text-gray-500">Not applicable</div>;
    }

    const timer = getTimerForOrder(order.id);

    if (!timer) {
      return <div className="text-sm text-gray-500">Calculating...</div>;
    }

    if (timer.isExpired) {
      return (
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-red-600">Expired</span>
        </div>
      );
    }

    // Calculate danger level - turn red when less than 5 minutes left
    const isDanger = timer.timeLeft < 5 * 60 * 1000;

    return (
      <div
        className={`flex items-center space-x-2 ${
          isDanger ? "text-red-600" : "text-gray-700"
        }`}
      >
        <Clock
          className={`w-4 h-4 ${isDanger ? "text-red-500" : "text-gray-500"}`}
        />
        <div className="text-sm font-mono font-semibold">
          {formatCountdown(timer.timeLeft)}
        </div>
        <div className="text-xs text-gray-500">left</div>
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No orders found
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
              Request No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tasker's Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time Left
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            return (
              <>
                {/* Main Row */}
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => toggleRowExpansion(order.id)}
                >
                  {/* <td className="px-2 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.requestNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Image
                      src={
                        order.taskerProfileImage ||
                        "/assets/images/users/default-avatar.jpg"
                      }
                      alt={order.taskerName}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.taskerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.taskerPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.clientPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTimerDisplay(order)}
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr className="bg-gray-50/30">
                    <td colSpan={8} className="px-4 py-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Basic Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <Briefcase className="w-4 h-4 mr-2" />
                              Basic Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Request #
                                </span>
                                <span className="text-sm text-gray-900 font-medium">
                                  {order.requestNumber}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Category
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.category}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Requested Skill
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.requestedSkill}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Created
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {formatDateTime(order.createdAt)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Updated
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {formatDateTime(order.updatedAt)}
                                </span>
                              </div>
                              {/* Timer in details */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Time Remaining
                                </span>
                                <div className="flex items-center">
                                  {getTimerDisplay(order)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Date & Time Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Schedule Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Scheduled Date
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.fromDate || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Scheduled Time
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {formatTime(order.fromTime)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  From
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {formatDateTime(order.fromDateTime)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  To
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {formatDateTime(order.toDateTime)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Location Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Location Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Location
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.location}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Client Address
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.clientAddress || "N/A"}
                                </span>
                              </div>
                              {order.latitude && order.longitude && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Coordinates
                                  </span>
                                  <span className="text-sm  text-gray-900 font-medium">
                                    {order.latitude.toFixed(6)},{" "}
                                    {order.longitude.toFixed(6)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Distance
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.taskDistance?.toFixed(2)} km
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Client Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Client Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Name
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.clientName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Phone
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.clientPhone}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Rating
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.clientRating} ⭐
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Completed Tasks
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.clientCompleteTasks}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Approved
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.isClientApproved ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tasker Information */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Tasker Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Name
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.taskerName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Phone
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.taskerPhone}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Rating
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.taskerRating} ⭐
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Completed Tasks
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.taskerCompleteTasks}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Approved
                                </span>
                                <span className="text-sm  text-gray-900 font-medium">
                                  {order.isTaskerApproved ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </span>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600 block mb-2">
                                  About Tasker:
                                </span>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                  {order.aboutClient ||
                                    "No description available"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Task Description */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Task Description
                            </h4>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {order.description || "No description provided"}
                            </p>
                          </div>

                          {/* Images Section */}
                          {order.images && order.images.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Task Images ({order.images.length})
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {order.images.slice(0, 6).map((img, index) => (
                                  <div
                                    key={index}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                                  >
                                    <Image
                                      src={img}
                                      alt={`Task image ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100px, 150px"
                                    />
                                  </div>
                                ))}
                                {order.images.length > 6 && (
                                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm text-gray-500">
                                      +{order.images.length - 6} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
