"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  MessageCircle,
  XCircle,
  Calendar,
  CreditCard,
  Wallet,
  Building,
} from "lucide-react";
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
} from "@/types/payment";

interface PaymentsTableProps {
  payments: Payment[];
  onProcessPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
}

export default function PaymentsTable({
  payments,
  onProcessPayment,
  onRejectPayment,
}: PaymentsTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (paymentId: string) => {
    setActiveDropdown(activeDropdown === paymentId ? null : paymentId);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || {
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const methodConfig = {
      mpesa: { icon: CreditCard, color: "text-green-600" },
      bank: { icon: Building, color: "text-blue-600" },
      wallet: { icon: Wallet, color: "text-purple-600" },
    };

    const config = methodConfig[method] || {
      icon: CreditCard,
      color: "text-gray-600",
    };

    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  const getPaymentTypeBadge = (type: PaymentType) => {
    const typeConfig = {
      deposit: { color: "bg-blue-100 text-blue-800", label: "Deposit" },
      withdrawal: {
        color: "bg-orange-100 text-orange-800",
        label: "Withdrawal",
      },
      payment: { color: "bg-green-100 text-green-800", label: "Payment" },
      refund: { color: "bg-purple-100 text-purple-800", label: "Refund" },
    };

    const config = typeConfig[type] || {
      color: "bg-gray-100 text-gray-800",
      label: type || "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No payments found
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
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            
           
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
           
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>

          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr
              key={payment._id}
              className={`
                hover:bg-gray-50/50 transition-colors
                ${payment.status === "completed" ? "bg-green-50/30" : ""}
                ${payment.status === "failed" ? "bg-red-50/30" : ""}
              `}
            >
              {/* User Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      payment.user?.avatar_url ||
                      "/assets/images/users/default-avatar.jpg"
                    }
                    alt={payment.user?.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.user?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.user?.phone || "N/A"}
                    </div>
                  </div>
                </div>
              </td>

              {/* Type Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getPaymentTypeBadge(payment.type)}
              </td>

              {/* Amount Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  KES {payment.amount?.toLocaleString() || "0"}
                </div>
              </td>

        

              {/* Phone Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {payment.phone_number || "N/A"}
                </div>
              </td>

             
              {/* Created Date Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(payment.createdAt)}
                </div>
              </td>

          


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
