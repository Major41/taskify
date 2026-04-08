"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrdersTable from "@/components/Orders/OrdersTable";
import OrdersFilters from "@/components/Orders/OrdersFilters";
import Pagination from "@/components/Clients/Pagination";
import { Order, OrderStatus } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";

// Define status values for validation - updated to match your API
const ORDER_STATUS_VALUES = [
  "Pending",
  "Expired",
  "Declined",
  "Accepted",
  "Ongoing",
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
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all fetched orders
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]); // Orders to display on current page
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | "all">(
    "all",
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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

  // Apply filters whenever allOrders, searchQuery, or selectedStatus changes
  useEffect(() => {
    filterAndPaginateOrders();
  }, [allOrders, searchQuery, selectedStatus, currentPage]);

  const fetchRequestsByStatus = async (
    status: string,
  ): Promise<ApiRequest[]> => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/requests/by/notificationStatus?notification_status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} requests`);
      }

      const data = await response.json();
      console.log(`Fetched ${status} requests:`, data.requests?.length || 0);
      return data.requests || [];
    } catch (error) {
      console.error(`Error fetching ${status} requests:`, error);
      return [];
    }
  };

  const transformApiRequestToOrder = (apiRequest: any): Order => {
    // Safely extract date and time information
    const fromDateTime = apiRequest.scheduled_date
      ? new Date(
          `${apiRequest.scheduled_date}T${apiRequest.scheduled_time || "00:00"}`,
        ).getTime()
      : apiRequest.date_of_request;

    const toDateTime = apiRequest.scheduled_date
      ? new Date(
          `${apiRequest.scheduled_date}T${apiRequest.scheduled_time || "23:59"}`,
        ).getTime()
      : apiRequest.date_of_request;

    return {
      id: apiRequest.request_id || "",
      requestNumber: apiRequest.receipt_no || "",

      // Tasker information (from tasker.user object)
      taskerName: apiRequest.tasker?.user
        ? `${apiRequest.tasker.user.first_name || ""} ${
            apiRequest.tasker.user.last_name || ""
          }`.trim()
        : "Not Assigned",
      taskerPhone: apiRequest.tasker?.user?.phone_number || "",
      taskerProfileImage: apiRequest.tasker?.user?.profile_url || "",

      // Client information (from user object)
      clientName: apiRequest.user
        ? `${apiRequest.user.first_name || ""} ${
            apiRequest.user.last_name || ""
          }`.trim()
        : "Unknown Client",
      clientPhone: apiRequest.user?.phone_number || "",

      // Task information
      description: apiRequest.task_description || "",
      aboutClient: apiRequest.tasker?.tasker_about || "",
      budget: "",

      // Images handling
      images: apiRequest.task_images || [],
      requestedSkill: apiRequest.requested_skill || "",

      // Date and time
      fromDate: apiRequest.scheduled_date || "",
      fromTime: apiRequest.scheduled_time || "",
      fromDateTime: fromDateTime,
      toDateTime: toDateTime,

      // Location information
      location: apiRequest.task_location || "",
      latitude: apiRequest.task_latitude || null,
      longitude: apiRequest.task_longitude || null,

      // Category/status
      category: apiRequest.requested_skill || "",
      status: apiRequest.notification_status || "Pending",

      // Timestamps
      createdAt: apiRequest.date_of_request || Date.now(),
      updatedAt:
        apiRequest.date_of_task_notification ||
        apiRequest.date_of_request ||
        Date.now(),

      // Additional useful information from your API
      taskDistance: apiRequest.task_distance || 0,
      taskerRating: apiRequest.tasker?.tasker_average_rating || 0,
      clientRating: apiRequest.user?.client_average_rating || 0,
      taskerCompleteTasks: apiRequest.tasker?.tasker_complete_tasks || 0,
      clientCompleteTasks: apiRequest.user?.client_complete_tasks || 0,
      isTaskerApproved: apiRequest.tasker?.is_approved || false,
      isClientApproved: apiRequest.user?.isClientApproved || false,

      // Tasker job images if needed
      taskerJobImages: apiRequest.tasker?.job_images || [],

      // Client address for better location context
      clientAddress: apiRequest.user?.address || "",
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
        ongoingRequests,
        completedRequests,
        cancelledRequests,
      ] = await Promise.all([
        fetchRequestsByStatus("Pending"),
        fetchRequestsByStatus("Expired"),
        fetchRequestsByStatus("Declined"),
        fetchRequestsByStatus("Accepted"),
        fetchRequestsByStatus("Ongoing"),
        fetchRequestsByStatus("Completed"),
        fetchRequestsByStatus("Cancelled"),
      ]);

      // Combine all requests
      const allRequests = [
        ...pendingRequests,
        ...expiredRequests,
        ...declinedRequests,
        ...acceptedRequests,
        ...ongoingRequests,
        ...completedRequests,
        ...cancelledRequests,
      ];

      // Transform API requests to Order format
      const transformedOrders = allRequests.map(transformApiRequestToOrder);

      setAllOrders(transformedOrders);
      console.log("Loaded orders:", transformedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateOrders = () => {
    // First, filter the orders
    let filtered = [...allOrders];

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
          order.category?.toLowerCase().includes(query),
      );
    }

    // Update total filtered count
    setTotalItems(filtered.length);

    // Calculate total pages based on filtered results
    const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(newTotalPages || 1);

    // If current page is greater than new total pages, reset to page 1
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }

    // Get the current page of data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setDisplayedOrders(paginatedData);
  };

  // Calculate counts for each status
  const getStatusCounts = () => {
    return {
      all: allOrders.length,
      Pending: allOrders.filter((order) => order.status === "Pending").length,
      Expired: allOrders.filter((order) => order.status === "Expired").length,
      Declined: allOrders.filter((order) => order.status === "Declined").length,
      Accepted: allOrders.filter((order) => order.status === "Accepted").length,
      Ongoing: allOrders.filter((order) => order.status === "Ongoing").length,
      Completed: allOrders.filter((order) => order.status === "Completed")
        .length,
      Cancelled: allOrders.filter((order) => order.status === "Cancelled")
        .length,
    };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading && allOrders.length === 0) {
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
              Showing {displayedOrders.length} of {totalItems} requests
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <OrdersFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalOrders={allOrders.length}
              filteredCount={totalItems}
              statusCounts={statusCounts}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <OrdersTable orders={displayedOrders} />
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            hasNextPage={currentPage < totalPages}
            hasPrevPage={currentPage > 1}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Empty State */}
      {totalItems === 0 && !loading && (
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
            {allOrders.length === 0
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
        Copyright Tasksfy Inc © 2026.
      </div>
    </div>
  );
}
