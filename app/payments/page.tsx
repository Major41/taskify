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
      const response = await fetch("/api/admin/payments");

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
      } else {
        throw new Error(data.message || "Failed to load payments");
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await fetch("/api/admin/payments/stats");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load payment stats:", error);
    }
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
          payment.recipient.name.toLowerCase().includes(query) ||
          payment.recipient.phone.toLowerCase().includes(query) ||
          payment.order.requestNumber.toLowerCase().includes(query) ||
          payment.transactionId?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleProcessPayment = async (paymentId: string) => {
    try {
      const response = await fetch("/api/admin/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          status: "completed",
        }),
      });

      if (response.ok) {
        // Refresh payments and stats
        await loadPayments();
        await loadPaymentStats();
      }
    } catch (error) {
      console.error("Failed to process payment:", error);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;

    try {
      const response = await fetch("/api/admin/payments/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          status: "failed",
        }),
      });

      if (response.ok) {
        // Refresh payments and stats
        await loadPayments();
        await loadPaymentStats();
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

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
