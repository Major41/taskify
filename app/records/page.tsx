"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  Receipt,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MpesaRecord {
  _id: string;
  CheckoutRequestID: string;
  clientId: string;
  MerchantRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  Amount: string;
  MpesaReceiptNumber: string;
  TransactionDate: string;
  PhoneNumber: string;
}

export default function AdminRecordsPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState<MpesaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "success" | "failed"
  >("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/all/mpesa/payments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (data.success && data.mpesaPaymentRecords) {
        // Transform the API response to match our interface
        const transformedRecords = data.mpesaPaymentRecords.map(
          (record: any, index: number) => ({
            _id: record.CheckoutRequestID || `record-${index}`, // Use CheckoutRequestID as _id
            CheckoutRequestID: record.CheckoutRequestID,
            clientId: record.clientId,
            MerchantRequestID: record.MerchantRequestID,
            ResultCode: record.ResultCode,
            ResultDesc: record.ResultDesc,
            Amount: record.Amount,
            MpesaReceiptNumber: record.MpesaReceiptNumber,
            TransactionDate: record.TransactionDate,
            PhoneNumber: record.PhoneNumber,
          })
        );

        setRecords(transformedRecords);
      } else {
        console.error("Failed to load records:", data.message);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on search and status
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.CheckoutRequestID.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      record.PhoneNumber.includes(searchTerm) ||
      record.MpesaReceiptNumber.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      record.Amount.includes(searchTerm) ||
      record.MerchantRequestID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "success" && record.ResultCode === 0) ||
      (filterStatus === "failed" && record.ResultCode !== 0);

    return matchesSearch && matchesStatus;
  });

  const successCount = records.filter((r) => r.ResultCode === 0).length;
  const failedCount = records.filter((r) => r.ResultCode !== 0).length;
  const totalCount = records.length;

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
      };
    } catch (error) {
      console.error("Error formatting date:", dateString);
      return {
        date: "Invalid Date",
        time: "Invalid Time",
      };
    }
  };

  const getStatusInfo = (resultCode: number) => {
    if (resultCode === 0) {
      return {
        text: "Completed",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    } else {
      return {
        text: "Failed",
        color: "bg-red-100 text-red-800",
        icon: CheckCircle,
      };
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);

      const headers = [
        "Checkout Request ID",
        "Merchant Request ID",
        "Phone Number",
        "Amount",
        "Date",
        "Time",
        "Status",
        "Receipt Number",
        "Description",
        "Client ID",
      ];
      const csvData = filteredRecords.map((record) => {
        const { date, time } = formatDateTime(record.TransactionDate);
        const status = getStatusInfo(record.ResultCode).text;

        return [
          record.CheckoutRequestID,
          record.MerchantRequestID,
          record.PhoneNumber,
          record.Amount,
          date,
          time,
          status,
          record.MpesaReceiptNumber,
          record.ResultDesc,
          record.clientId,
        ];
      });

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mpesa-records-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MPESA Records</h1>
          <p className="text-gray-600 mt-2">
            View all MPESA transaction records and payments
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="text-blue-800 text-sm font-medium">
              Total: {totalCount}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <span className="text-green-800 text-sm font-medium">
              Success: {successCount}
            </span>
          </div>
          <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            <span className="text-red-800 text-sm font-medium">
              Failed: {failedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt, phone, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-black pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all"
            />
          </div>

          {/* Filter and Export */}
          <div className="flex gap-3 w-full sm:w-auto">
           

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={exporting || filteredRecords.length === 0}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Checkout Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Number
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const { date, time } = formatDateTime(record.TransactionDate);
                  const statusInfo = getStatusInfo(record.ResultCode);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      {/* Checkout Request ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {record.CheckoutRequestID}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.MerchantRequestID}
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {record.PhoneNumber}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          KES {parseInt(record.Amount).toLocaleString()}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div>{date}</div>
                            <div className="text-gray-500 text-xs">{time}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                        {record.ResultCode !== 0 && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {record.ResultDesc}
                          </div>
                        )}
                      </td>

                      {/* Receipt Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-mono">
                            {record.MpesaReceiptNumber || "N/A"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No MPESA records found
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {searchTerm || filterStatus !== "all"
                          ? "No records match your search criteria. Try adjusting your search or filter."
                          : "No MPESA transaction records found."}
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
      {filteredRecords.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredRecords.length} of {records.length} records
          </div>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-1"></div>
              Success: {successCount}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full mr-1"></div>
              Failed: {failedCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
