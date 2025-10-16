"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrdersTable from "@/components/Orders/OrdersTable";
import OrdersFilters from "@/components/Orders/OrdersFilters";
import { Order, OrderStatus } from "@/types/order";

// Define status values for validation
const ORDER_STATUS_VALUES = [
  "Pending",
  "Negotiation",
  "Ongoing",
  "Completed",
  "Cancelled",
  "Expired",
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | "all">(
    "all"
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ORDER_STATUS_VALUES.includes(filter as OrderStatus)) {
      setSelectedStatus(filter as OrderStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.requestNumber.toLowerCase().includes(query) ||
          order.taskerName.toLowerCase().includes(query) ||
          order.clientName.toLowerCase().includes(query) ||
          order.clientPhone.toLowerCase().includes(query) ||
          order.description.toLowerCase().includes(query) ||
          order.location?.toLowerCase().includes(query) ||
          order.category?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  // Calculate counts for each status
  const getStatusCounts = () => {
    return {
      all: orders.length,
      Pending: orders.filter((order) => order.status === "Pending").length,
      Expired: orders.filter((order) => order.status === "Expired").length,
      Negotiation: orders.filter((order) => order.status === "In Negotiation")
        .length,
      Ongoing: orders.filter((order) => order.status === "Ongoing").length,
      Cancelled: orders.filter((order) => order.status === "Cancelled").length,
      Completed: orders.filter((order) => order.status === "Completed").length,
    };
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        await loadOrders();
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadOrders();
        alert("Order deleted successfully");
      } else {
        throw new Error("Failed to delete order");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Task Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredOrders.length} of {orders.length} orders
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <OrdersFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalOrders={orders.length}
              filteredCount={filteredOrders.length}
              statusCounts={statusCounts}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <OrdersTable
          orders={filteredOrders}
          onStatusUpdate={handleStatusUpdate}
          onDeleteOrder={handleDeleteOrder}
        />
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {orders.length === 0
              ? "No orders have been created yet. Orders will appear here once clients start making requests."
              : "No orders match your current filters. Try adjusting your search criteria."}
          </p>
          {(searchQuery || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
