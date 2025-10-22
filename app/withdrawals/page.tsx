"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  CreditCard,
  X,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

interface StatsData {
  totalWithdrawals: number;
  totalDeposits: number;
  totalCancelled: number;
  totalCompleted: number;
  netProfit: number;
}

export default function AdminWithdrawalsPage() {
  const { token } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "processed"
  >("all");
  const [stats, setStats] = useState<StatsData>({
    totalWithdrawals: 0,
    totalDeposits: 0,
    totalCancelled: 0,
    totalCompleted: 0,
    netProfit: 0,
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      const endpoints = [
        "https://tasksfy.com/v1/web/superAdmin/transactions/total/withdrawal/stats",
        "https://tasksfy.com/v1/web/superAdmin/transactions/total/deposit/stats",
        "https://tasksfy.com/v1/web/superAdmin/transactions/total/canceled/stats",
        "https://tasksfy.com/v1/web/superAdmin/transactions/total/completed/stats",
        "https://tasksfy.com/v1/web/superAdmin/transactions/total/net/profit/stats"
      ];

      const [withdrawalsRes, depositsRes, cancelledRes, completedRes, netProfitRes] = await Promise.all(
        endpoints.map(endpoint =>
          fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      // Parse all responses
      const withdrawalsData = await withdrawalsRes.json();
      const depositsData = await depositsRes.json();
      const cancelledData = await cancelledRes.json();
      const completedData = await completedRes.json();
      const netProfitData = await netProfitRes.json();

      console.log("Stats API Responses:", {
        withdrawals: withdrawalsData,
        deposits: depositsData,
        cancelled: cancelledData,
        completed: completedData,
        netProfit: netProfitData
      });

      setStats({
        totalWithdrawals: withdrawalsData || 0,
        totalDeposits: depositsData || 0,
        totalCancelled: cancelledData || 0,
        totalCompleted: completedData || 0,
        netProfit: netProfitData || 0,
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      showAlert("error", "Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

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
        // Refresh stats after approval
        await fetchStats();
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
        // Refresh stats after rejection
        await fetchStats();
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

  // Filter withdrawals based on status
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !withdrawal.isPaymentApproved) ||
      (filterStatus === "processed" && withdrawal.isPaymentApproved);

    return matchesStatus;
  });

  const pendingCount = withdrawals.filter((w) => !w.isPaymentApproved).length;
  const processedCount = withdrawals.filter((w) => w.isPaymentApproved).length;
  const allCount = withdrawals.length;

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Withdrawals Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Withdrawals
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  stats.totalWithdrawals.toLocaleString()
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time withdrawals
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Deposits
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                ) : (
                  stats.totalDeposits.toLocaleString()
                )}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time deposits
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Cancelled Payments Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Cancelled Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                ) : (
                  stats.totalCancelled.toLocaleString()
                )}
              </p>
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time cancelled
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Completed Payments Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Completed Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                ) : (
                  stats.totalCompleted.toLocaleString()
                )}
              </p>
              <p className="text-xs text-purple-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time completed
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                ) : (
                  `KES ${stats.netProfit.toLocaleString()}`
                )}
              </p>
              <p className="text-xs text-orange-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Current net profit
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

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
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="text-blue-800 text-sm font-medium">
              All: {allCount}
            </span>
          </div>
          <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
            <span className="text-yellow-800 text-sm font-medium">
              Pending: {pendingCount}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <span className="text-green-800 text-sm font-medium">
              Processed: {processedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Filter by status:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Payments
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {allCount}
                </span>
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "pending"
                    ? "bg-yellow-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending Payments
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              </button>
              <button
                onClick={() => setFilterStatus("processed")}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "processed"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Processed Payments
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {processedCount}
                </span>
              </button>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {filterStatus !== "all" && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Showing:{" "}
                <span className="font-medium text-gray-700">
                  {filterStatus === "pending" ? "Pending" : "Processed"}{" "}
                  payments
                </span>
              </span>
              <button
                onClick={() => setFilterStatus("all")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Requested
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
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50">
                    {/* Tasker Profile and Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {withdrawal.user?.profile_url ? (
                            <img
                              src={withdrawal.user.profile_url}
                              alt={`${withdrawal.user.first_name} ${withdrawal.user.last_name}`}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.user?.first_name}{" "}
                            {withdrawal.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {withdrawal.phoneNumber}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KES {withdrawal.withdrawAmount.toLocaleString()}
                      </div>
                    </td>

                    {/* Date Requested */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(
                          withdrawal.dateOfPaymentRequest
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(
                          withdrawal.dateOfPaymentRequest
                        ).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          withdrawal.isPaymentApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {withdrawal.isPaymentApproved ? "Processed" : "Pending"}
                      </span>
                      {withdrawal.isPaymentApproved && withdrawal.mpesaCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Code: {withdrawal.mpesaCode}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!withdrawal.isPaymentApproved ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(withdrawal._id)}
                            disabled={approving === withdrawal._id}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                          >
                            {approving === withdrawal._id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {approving === withdrawal._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal._id)}
                            disabled={rejecting === withdrawal._id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                          >
                            {rejecting === withdrawal._id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {rejecting === withdrawal._id ? "..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No withdrawal requests found
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {filterStatus !== "all"
                          ? `No ${filterStatus} withdrawal requests found.`
                          : "No withdrawal requests have been made yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer Info */}
      {filteredWithdrawals.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredWithdrawals.length} of {withdrawals.length}{" "}
            requests
          </div>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full mr-1"></div>
              Pending: {pendingCount}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-1"></div>
              Processed: {processedCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}