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

interface MpesaRecord {
  _id: string;
  clientId: string;
  merchantRequestID: string;
  resultCode: number;
  resultDesc: string;
  amount: string;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
}

export default function AdminRecordsPage() {
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
      const response = await fetch("/api/admin/records");
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      } else {
        console.error("Failed to load records:", data.message);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on search and status
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phoneNumber.includes(searchTerm) ||
      record.mpesaReceiptNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.amount.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "success" && record.resultCode === 0) ||
      (filterStatus === "failed" && record.resultCode !== 0);

    return matchesSearch && matchesStatus;
  });

  const successCount = records.filter((r) => r.resultCode === 0).length;
  const failedCount = records.filter((r) => r.resultCode !== 0).length;
  const totalCount = records.length;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
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
        "Transaction ID",
        "Phone Number",
        "Amount",
        "Date",
        "Time",
        "Status",
        "Receipt Number",
        "Description",
      ];
      const csvData = filteredRecords.map((record) => {
        const { date, time } = formatDateTime(record.transactionDate);
        const status = getStatusInfo(record.resultCode).text;

        return [
          record._id,
          record.phoneNumber,
          record.amount,
          date,
          time,
          status,
          record.mpesaReceiptNumber,
          record.resultDesc,
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
      <div className=" mb-6">
        <div className="">
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
      

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
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
                  const { date, time } = formatDateTime(record.transactionDate);
                  const statusInfo = getStatusInfo(record.resultCode);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      {/* Transaction ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {record._id}
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {record.phoneNumber}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          KES {parseInt(record.amount).toLocaleString()}
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
                        {record.resultCode !== 0 && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {record.resultDesc}
                          </div>
                        )}
                      </td>

                      {/* Receipt Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-mono">
                            {record.mpesaReceiptNumber || "N/A"}
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
