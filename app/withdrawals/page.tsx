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
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  // Date range state with individual date controls
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Individual date components for manual selection
  const [manualStartDate, setManualStartDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });

  const [manualEndDate, setManualEndDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });

  const [selectionMode, setSelectionMode] = useState<"calendar" | "manual">(
    "calendar"
  );

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  // Generate years (last 10 years + next 2 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // Generate months
  const generateMonths = () => {
    return [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ];
  };

  // Generate days based on month and year
  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Convert manual date to Date object
  const manualDateToDate = (manualDate: {
    year: number;
    month: number;
    day: number;
  }) => {
    return new Date(manualDate.year, manualDate.month - 1, manualDate.day);
  };

  // Apply manual date selection
  const applyManualDates = () => {
    const newStartDate = manualDateToDate(manualStartDate);
    const newEndDate = manualDateToDate(manualEndDate);

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Convert Date to Unix timestamp in milliseconds
  const dateToUnixMillis = (date: Date | null): number => {
    if (!date) return 0;
    return date.getTime();
  };

  // Get query parameters for date range
  const getDateQueryParams = (): string => {
    const params = new URLSearchParams();

    if (startDate) {
      params.append("from", dateToUnixMillis(startDate).toString());
    }

    if (endDate) {
      params.append("to", dateToUnixMillis(endDate).toString());
    }

    return params.toString();
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const baseEndpoints = [
        "total/withdrawal/stats",
        "total/deposit/stats",
        "total/canceled/stats",
        "total/completed/stats",
        "total/net/profit/stats",
      ];

      const dateParams = getDateQueryParams();

      const endpoints = baseEndpoints.map(
        (endpoint) =>
          `https://tasksfy.com/v1/web/superAdmin/transactions/${endpoint}${
            dateParams ? `?${dateParams}` : ""
          }`
      );

      const [
        withdrawalsRes,
        depositsRes,
        cancelledRes,
        completedRes,
        netProfitRes,
      ] = await Promise.all(
        endpoints.map((endpoint) =>
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
    const response = await fetch(
      "https://tasksfy.com/v1/web/superAdmin/transactions/payment/requests",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log("Fetched withdrawals data:", data);

      if (data.success) {
        setWithdrawals(data.PaymentWithUserInfo);
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

  const handleApplyDateFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      showAlert("error", "Start date cannot be after end date");
      return;
    }
    fetchStats();
    setShowDateFilter(false);
  };

 const handleClearDateFilter = () => {
   setStartDate(null);
   setEndDate(null);

   // Also reset the manual dates to current date
   const currentDate = new Date();
   setManualStartDate({
     year: currentDate.getFullYear(),
     month: currentDate.getMonth() + 1,
     day: currentDate.getDate(),
   });
   setManualEndDate({
     year: currentDate.getFullYear(),
     month: currentDate.getMonth() + 1,
     day: currentDate.getDate(),
   });

   // Close the filter panel
   setShowDateFilter(false);

   // Force refetch stats without any date filters
   fetchStats();
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

  const hasActiveDateFilter = startDate || endDate;

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

      {/* Enhanced Date Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Statistics Date Range
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {hasActiveDateFilter
                ? `Showing data from ${
                    startDate ? startDate.toLocaleDateString() : "beginning"
                  } to ${endDate ? endDate.toLocaleDateString() : "now"}`
                : "Showing all-time statistics"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {hasActiveDateFilter && (
              <button
                onClick={handleClearDateFilter}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filter
              </button>
            )}

            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {hasActiveDateFilter ? "Change Dates" : "Filter by Date"}
            </button>
          </div>
        </div>

        {/* Enhanced Date Picker Form */}
        {showDateFilter && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            {/* Selection Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectionMode("calendar")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  selectionMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar Picker
              </button>
              <button
                onClick={() => setSelectionMode("manual")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  selectionMode === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Manual Selection
              </button>
            </div>

            {selectionMode === "calendar" ? (
              /* Calendar Picker */
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Date Range (Calendar)
                  </label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      const [start, end] = update;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    isClearable={true}
                    placeholderText="Click to select a date range"
                    monthsShown={2}
                    showPopperArrow={false}
                    className="w-full px-4 Select Date text-black py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                    dayClassName={(date) =>
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear()
                        ? "bg-blue-100 text-blue-600 rounded-full"
                        : undefined
                    }
                  />
                </div>
              </div>
            ) : (
              /* Manual Date Selection */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Start Date
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Year
                      </label>
                      <select
                        value={manualStartDate.year}
                        onChange={(e) =>
                          setManualStartDate((prev) => ({
                            ...prev,
                            year: parseInt(e.target.value),
                            day: 1, // Reset day when year changes
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateYears().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Month
                      </label>
                      <select
                        value={manualStartDate.month}
                        onChange={(e) =>
                          setManualStartDate((prev) => ({
                            ...prev,
                            month: parseInt(e.target.value),
                            day: 1, // Reset day when month changes
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateMonths().map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Day
                      </label>
                      <select
                        value={manualStartDate.day}
                        onChange={(e) =>
                          setManualStartDate((prev) => ({
                            ...prev,
                            day: parseInt(e.target.value),
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateDays(
                          manualStartDate.year,
                          manualStartDate.month
                        ).map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-black">
                    Selected:{" "}
                    {manualDateToDate(manualStartDate).toLocaleDateString()}
                  </div>
                </div>

                {/* End Date Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    End Date
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Year
                      </label>
                      <select
                        value={manualEndDate.year}
                        onChange={(e) =>
                          setManualEndDate((prev) => ({
                            ...prev,
                            year: parseInt(e.target.value),
                            day: 1,
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateYears().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Month
                      </label>
                      <select
                        value={manualEndDate.month}
                        onChange={(e) =>
                          setManualEndDate((prev) => ({
                            ...prev,
                            month: parseInt(e.target.value),
                            day: 1,
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateMonths().map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Day
                      </label>
                      <select
                        value={manualEndDate.day}
                        onChange={(e) =>
                          setManualEndDate((prev) => ({
                            ...prev,
                            day: parseInt(e.target.value),
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {generateDays(
                          manualEndDate.year,
                          manualEndDate.month
                        ).map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Selected:{" "}
                    {manualDateToDate(manualEndDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Apply Manual Dates Button */}
                <div className="md:col-span-2">
                  <button
                    onClick={applyManualDates}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply Manual Dates
                  </button>
                </div>
              </div>
            )}

            {/* Selected Dates Preview */}
            {(startDate || endDate) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Selected Range:
                </p>
                <p className="text-sm text-blue-600">
                  {startDate ? startDate.toLocaleDateString() : "Start date"}
                  {" → "}
                  {endDate ? endDate.toLocaleDateString() : "End date"}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDateFilter(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDateFilter}
                disabled={!startDate && !endDate}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>

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
                {hasActiveDateFilter ? "Selected period" : "All time"}
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
                {hasActiveDateFilter ? "Selected period" : "All time"}
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
                {hasActiveDateFilter ? "Selected period" : "All time"}
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
                {hasActiveDateFilter ? "Selected period" : "All time"}
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
                {hasActiveDateFilter ? "Selected period" : "Current"}
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
                          {withdrawal.profileUrl ? (
                            <img
                              src={withdrawal.profileUrl}
                              alt={`${withdrawal.firstName} ${withdrawal.lastName}`}
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
                            {withdrawal?.firstName}{" "}
                            {withdrawal?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal.email}
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
