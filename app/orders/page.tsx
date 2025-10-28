"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrdersTable from "@/components/Orders/OrdersTable";
import OrdersFilters from "@/components/Orders/OrdersFilters";
import { Order, OrderStatus } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";

// Define status values for validation - updated to match your API
const ORDER_STATUS_VALUES = [
  "Pending",
  "Expired",
  "Declined",
  "Accepted",
  "Completed",
  "Cancelled",
] as const;

// Define the API status mapping
const API_STATUS_MAPPING = {
  Pending: "Pending",
  Expired: "Expired",
  Declined: "Declined",
  Accepted: "Accepted",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;

interface ApiRequest {
  request_id: string;
  client_id: string;
  tasker_id?: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  category: string;
  status: string;
  notification_status: string;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  tasker?: {
    first_name: string;
    last_name: string;
  };
}

export default function OrdersPage() {
  const { token } = useAuth();
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

  const fetchRequestsByStatus = async (
    status: string
  ): Promise<ApiRequest[]> => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/requests/by/notificationStatus?notification_status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} requests`);
      }

      const data = await response.json();
      return data.requests || [];
    } catch (error) {
      console.error(`Error fetching ${status} requests:`, error);
      return [];
    }
  };

  const transformApiRequestToOrder = (apiRequest: ApiRequest): Order => {
    console.log("Transforming API request:", apiRequest);
    return {
      id: apiRequest.request_id,
      requestNumber: apiRequest.receipt_no,
      taskerName: apiRequest.tasker
        ? `${apiRequest.tasker.user.first_name} ${apiRequest.tasker.user.last_name}`
        : "Not Assigned",
      taskerPhone: apiRequest.tasker.user.phone_number,
      clientName: apiRequest.user
        ? `${apiRequest.user.first_name} ${apiRequest.user.last_name}`
        : "Unknown Client",
      clientPhone: apiRequest?.user?.phone_number,
      description: apiRequest.description,
      budget: apiRequest.budget,
      location: apiRequest.location,
      category: apiRequest.category,
      status: apiRequest.notification_status as OrderStatus,
      createdAt: apiRequest.date_of_request,
      updatedAt: apiRequest.date_of_request,
      taskerProfileImage: apiRequest?.tasker?.user?.profile_url,
    };
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Fetch requests for all statuses
      const [
        pendingRequests,
        expiredRequests,
        declinedRequests,
        acceptedRequests,
        completedRequests,
        cancelledRequests,
      ] = await Promise.all([
        fetchRequestsByStatus("Pending"),
        fetchRequestsByStatus("Expired"),
        fetchRequestsByStatus("Declined"),
        fetchRequestsByStatus("Accepted"),
        fetchRequestsByStatus("Completed"),
        fetchRequestsByStatus("Cancelled"),
      ]);

      // Combine all requests
      const allRequests = [
        ...pendingRequests,
        ...expiredRequests,
        ...declinedRequests,
        ...acceptedRequests,
        ...completedRequests,
        ...cancelledRequests,
      ];

      // Transform API requests to Order format
      const transformedOrders = allRequests.map(transformApiRequestToOrder);

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Fallback to empty array if API fails
      setOrders([]);
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
      Declined: orders.filter((order) => order.status === "Declined").length,
      Accepted: orders.filter((order) => order.status === "Accepted").length,
      Completed: orders.filter((order) => order.status === "Completed").length,
      Cancelled: orders.filter((order) => order.status === "Cancelled").length,
    };
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
              Task Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredOrders.length} of {orders.length} requests
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
            No requests found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {orders.length === 0
              ? "No requests have been created yet. Requests will appear here once clients start making requests."
              : "No requests match your current filters. Try adjusting your search criteria."}
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
