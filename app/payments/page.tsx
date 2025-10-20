"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaymentsTable from "@/components/Payments/PaymentsTable";
import PaymentsFilters from "@/components/Payments/PaymentsFilters";
import PaymentStatsCards from "@/components/Payments/PaymentStatsCards";
import { Payment, PaymentStats, PaymentStatus } from "@/types/payment";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | "all">(
    "all"
  );
  const searchParams = useSearchParams();

  // Get token from localStorage or your auth context
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    loadPayments();
    loadPaymentStats();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (
      filter &&
      (filter === "all" ||
        Object.values(["pending", "completed", "failed", "refunded"]).includes(
          filter
        ))
    ) {
      setSelectedStatus(filter as PaymentStatus | "all");
    }
  }, [searchParams]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, selectedStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/payments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();

      // Log the raw data to see the structure
      console.log("Raw payments API response:", data);

      // Transform the data based on the actual API response structure
      if (data.success && Array.isArray(data.data)) {
        const transformedPayments = data.data.map((payment: any) => ({
          id: payment.payment_id || payment.id,
          amount: payment.amount,
          currency: payment.currency || "KES",
          status: mapStatus(payment.status),
          type: payment.payment_type || "withdrawal",
          method: payment.payment_method || "mobile_money",
          user: {
            id: payment.user_id,
            name:
              payment.user_name || `${payment.first_name} ${payment.last_name}`,
            phone: payment.phone_number || payment.user_phone,
            email: payment.email || payment.user_email,
          },
          createdAt: payment.created_at || payment.timestamp,
          processedAt: payment.processed_at,
          reference: payment.reference || payment.transaction_id,
          notes: payment.notes || payment.description,
          // Add any other fields you see in the console log
        }));

        console.log("Transformed payments:", transformedPayments);
        setPayments(transformedPayments);
      } else {
        console.log("API response structure:", data);
        // If the structure is different, set the raw data and we'll adjust later
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.error("No authentication token found for stats");
        return;
      }

      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/payments/stats",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Raw payment stats API response:", data);

        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load payment stats:", error);
    }
  };

  // Helper function to map API status to our application status
  const mapStatus = (apiStatus: string): PaymentStatus => {
    const statusMap: { [key: string]: PaymentStatus } = {
      pending: "pending",
      completed: "completed",
      failed: "failed",
      refunded: "refunded",
      success: "completed",
      approved: "completed",
      rejected: "failed",
      cancelled: "failed",
    };

    return statusMap[apiStatus?.toLowerCase()] || "pending";
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (payment) => payment.status === selectedStatus
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.user?.name?.toLowerCase().includes(query) ||
          payment.user?.phone?.toLowerCase().includes(query) ||
          payment.user?.email?.toLowerCase().includes(query) ||
          payment.reference?.toLowerCase().includes(query)
      );
    }

    console.log("Filtered payments:", filtered);
    setFilteredPayments(filtered);
  };

  const handleProcessPayment = async (paymentId: string) => {
    try {
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/payments/process",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId,
            status: "completed",
          }),
        }
      );

      if (response.ok) {
        console.log(`Successfully processed payment: ${paymentId}`);
        // Refresh payments and stats
        await loadPayments();
        await loadPaymentStats();
      } else {
        console.error(`Failed to process payment: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to process payment:", error);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;

    try {
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/payments/reject",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId,
            status: "failed",
          }),
        }
      );

      if (response.ok) {
        console.log(`Successfully rejected payment: ${paymentId}`);
        // Refresh payments and stats
        await loadPayments();
        await loadPaymentStats();
      } else {
        console.error(`Failed to reject payment: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to reject payment:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Payment Requests
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredPayments.length} payments found
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <PaymentsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalPayments={payments.length}
              filteredCount={filteredPayments.length}
            />
          </div>
        </div>
      </div>

      {/* Payment Statistics */}
      {stats && <PaymentStatsCards stats={stats} />}

      {/* Payments Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <PaymentsTable
          payments={filteredPayments}
          onProcessPayment={handleProcessPayment}
          onRejectPayment={handleRejectPayment}
        />
      </div>

      {/* Debug section - remove in production */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Total payments: {payments.length}</p>
        <p>Filtered payments: {filteredPayments.length}</p>
        <details>
          <summary className="cursor-pointer">
            Raw payments data (first 2 items)
          </summary>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(payments.slice(0, 2), null, 2)}
          </pre>
        </details>
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
