"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  X,
  User,
  Phone,
  MapPin,
  FileText,
  Clock,
} from "lucide-react";
import { Order } from "@/types/order";

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function OrdersTable({
  orders,
  onStatusUpdate,
  onDeleteOrder,
}: OrdersTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDropdown = (orderId: string) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    // Map database notification_status values to display labels and colors
    const statusConfig: Record<string, { color: string; label: string }> = {
      // Common notification_status values
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

      // Add any other status values you might have in your database
    };

    // Normalize the status to lowercase for consistent matching
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Debug: Log the actual status values from your orders
  if (orders.length > 0) {
    const uniqueStatuses = [...new Set(orders.map((order) => order.status))];
    console.log("Unique status values in orders:", uniqueStatuses);
  }

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
    <>
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
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50/50 transition-colors"
              >
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
                  <div className="text-sm font-medium text-gray-900">
                    {order.taskerName}
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
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="relative inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                      BASIC INFORMATION
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Request Number
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedOrder.requestNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedOrder.category || "General"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateShort(selectedOrder.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                      LOCATION
                    </h4>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {selectedOrder.location || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasker Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    TASKER INFORMATION
                  </h4>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={
                        selectedOrder.taskerProfileImage ||
                        "/assets/images/users/default-avatar.jpg"
                      }
                      alt={selectedOrder.taskerName}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedOrder.taskerName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    CLIENT INFORMATION
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedOrder.clientName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedOrder.clientPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    TASK DESCRIPTION
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedOrder.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                {selectedOrder.amount && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                      BUDGET
                    </h4>
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-semibold text-blue-900">
                        KES {selectedOrder.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
