"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  DollarSign,
  User,
  Phone,
  Calendar,
} from "lucide-react";

interface WithdrawalRequest {
  _id: string;
  userId: string;
  phoneNumber: string;
  withdrawAmount: number;
  isPaymentApproved: boolean;
  dateOfPaymentRequest: number;
  dateOfPaymentApproval: number;
  mpesaCode: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    profile_url?: string;
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved"
  >("all");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/withdrawals");
      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.data);
      } else {
        showAlert("error", "Failed to load withdrawal requests");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      showAlert("error", "Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to approve this withdrawal request?")) {
      return;
    }

    try {
      setApproving(withdrawalId);
      const response = await fetch("/api/admin/withdrawals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId,
          action: "approve",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the local state
        setWithdrawals((prev) =>
          prev.map((w) =>
            w._id === withdrawalId
              ? {
                  ...w,
                  isPaymentApproved: true,
                  dateOfPaymentApproval: data.data.dateOfPaymentApproval,
                  mpesaCode: data.data.mpesaCode,
                }
              : w
          )
        );
        showAlert("success", "Withdrawal approved successfully");
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      showAlert("error", "Failed to approve withdrawal");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to reject this withdrawal request?")) {
      return;
    }

    try {
      setRejecting(withdrawalId);
      const response = await fetch("/api/admin/withdrawals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId,
          action: "reject",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state or update status
        setWithdrawals((prev) => prev.filter((w) => w._id !== withdrawalId));
        showAlert("success", "Withdrawal rejected successfully");
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      showAlert("error", "Failed to reject withdrawal");
    } finally {
      setRejecting(null);
    }
  };

  // Filter withdrawals based on search and status
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.user?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.phoneNumber.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !withdrawal.isPaymentApproved) ||
      (filterStatus === "approved" && withdrawal.isPaymentApproved);

    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawals.filter((w) => !w.isPaymentApproved).length;
  const approvedCount = withdrawals.filter((w) => w.isPaymentApproved).length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Alert */}
      {alert && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Withdrawal Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and approve user withdrawal requests
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
            <span className="text-yellow-800 text-sm font-medium">
              Pending: {pendingCount}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <span className="text-green-800 text-sm font-medium">
              Approved: {approvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "pending" | "approved"
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Withdrawal Requests ({filteredWithdrawals.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredWithdrawals.length > 0 ? (
            filteredWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        {withdrawal.user?.profile_url ? (
                          <img
                            src={withdrawal.user.profile_url}
                            alt={`${withdrawal.user.first_name} ${withdrawal.user.last_name}`}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {withdrawal.user?.first_name}{" "}
                          {withdrawal.user?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {withdrawal.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {withdrawal.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          KES {withdrawal.withdrawAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(
                            withdrawal.dateOfPaymentRequest
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            withdrawal.isPaymentApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {withdrawal.isPaymentApproved
                            ? "Approved"
                            : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* MPESA Code if approved */}
                    {withdrawal.isPaymentApproved && withdrawal.mpesaCode && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">
                          MPESA Code: <strong>{withdrawal.mpesaCode}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!withdrawal.isPaymentApproved && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(withdrawal._id)}
                        disabled={approving === withdrawal._id}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {approving === withdrawal._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {approving === withdrawal._id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal._id)}
                        disabled={rejecting === withdrawal._id}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {rejecting === withdrawal._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {rejecting === withdrawal._id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No withdrawal requests found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "All withdrawal requests have been processed"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
