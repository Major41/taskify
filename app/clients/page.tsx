// app/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientsTable from "@/components/Clients/ClientsTable";
import ClientsFilters from "@/components/Clients/ClientsFilters";
import Pagination from "@/components/Clients/Pagination";
import { Client, ClientStats } from "@/types/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientsPage() {
  const { token } = useAuth();
  const [allClients, setAllClients] = useState<Client[]>([]); // Store all fetched clients
  const [displayedClients, setDisplayedClients] = useState<Client[]>([]); // Clients to display on current page
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    loadClients(1);
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ["all", "active", "inactive"].includes(filter)) {
      setSelectedStatus(filter as "all" | "active" | "inactive");
    }
  }, [searchParams]);

  // Apply filters whenever allClients, searchQuery, or selectedStatus changes
  useEffect(() => {
    filterAndPaginateClients();
  }, [allClients, searchQuery, selectedStatus, currentPage]);

  const loadClients = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/clientsWithReviews?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      console.log("Clients API Response:", data);

      if (data.clientsWithReviews) {
        // Set pagination info
        setNextPage(data.nextPage);
        setPrevPage(data.prevPage);
        
        // Filter only clients (non-taskers) and transform the API response
        const clientUsers = data.clientsWithReviews;

        const transformedClients = clientUsers.map((user: any) => ({
          id: user.user.user_id,
          name:
            `${user.user.first_name || ""} ${
              user.user.last_name || ""
            }`.trim() || "Unknown Client",
          email: user.user.email || "No email",
          phone: user.user.phone_number || "No phone",
          profile_picture: user.user.profile_url,
          address: user.user.address || "Not specified",
          is_approved: user.user.isClientApproved,
          joined_date: user.user.dateOfRegistration,
          total_requests: user.user.total_requests || 0,
          client_complete_tasks: user.user.client_complete_tasks,
          is_active: user.user.is_active !== false,
          isPhone_number_verified: user.user.isPhone_number_verified || false,
          reviews: user.client_reviews,
          client_average_rating: user.user.client_average_rating,
          walletBalance: user.user.walletBalance,
        }));

        // Store the new clients
        setAllClients(transformedClients);
        setCurrentPage(page);
        
        // Update total items count (this should come from API ideally)
        // For now, we'll estimate based on nextPage presence
        if (!data.nextPage) {
          setTotalItems(page * itemsPerPage);
        }
      } else {
        throw new Error(data.message || "Failed to load clients");
      }
    } catch (error) {
      console.error("Failed to load clients:", error);
      setAllClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateClients = () => {
    // First, filter the clients
    let filtered = [...allClients];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((client) =>
        selectedStatus === "active"
          ? client.is_active && client.is_approved
          : !client.is_active || !client.is_approved
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.address && client.address.toLowerCase().includes(query))
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
    
    setDisplayedClients(paginatedData);
  };

  const loadClientStats = async () => {
    try {
      // Calculate stats from the allClients data
      const totalClients = allClients.length;
      const activeClients = allClients.filter(
        (c) => c.is_active && c.is_approved
      ).length;
      const inactiveClients = allClients.filter(
        (c) => !c.is_active || !c.is_approved
      ).length;
      const totalRequests = allClients.reduce(
        (sum, client) => sum + (client.total_requests || 0),
        0
      );
      const completedRequests = allClients.reduce(
        (sum, client) => sum + (client.client_complete_tasks || 0),
        0
      );

      const calculatedStats: ClientStats = {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        total_requests: totalRequests,
        completed_requests: completedRequests,
        new_this_month: allClients.filter((c) => {
          const joinedDate = new Date(c.joined_date);
          const now = new Date();
          return (
            joinedDate.getMonth() === now.getMonth() &&
            joinedDate.getFullYear() === now.getFullYear()
          );
        }).length,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load client stats:", error);
    }
  };

  // Reload stats when allClients change
  useEffect(() => {
    if (allClients.length > 0) {
      loadClientStats();
    }
  }, [allClients]);

  const handlePageChange = async (page: number) => {
    // If we're going to a page that requires new data from API
    if (page > Math.ceil(allClients.length / itemsPerPage) && nextPage) {
      await loadClients(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleNextPage = async () => {
    if (nextPage) {
      await loadClients(nextPage);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = async () => {
    if (prevPage) {
      await loadClients(prevPage);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSuspendClient = async (clientId: string, reason: string) => {
    try {
      console.log("Suspending client with ID:", clientId, "Reason:", reason);

      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/client/approval?user_id=${clientId}&is_client_approved=false&reason=${encodeURIComponent(
          reason
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let responseData;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
        console.log("Suspend Client API Response:", responseData);
      } else {
        const textResponse = await response.text();
        console.log("Suspend Client API Text Response:", textResponse);

        if (response.ok) {
          responseData = { success: true };
        } else {
          throw new Error(`Non-JSON response: ${textResponse}`);
        }
      }

      if (responseData.success) {
        alert("Client suspended successfully!");
        await loadClients(currentPage);
        await loadClientStats();
      } else {
        throw new Error(responseData.message || "Failed to suspend client");
      }
    } catch (error) {
      console.error("Failed to suspend client:", error);
      alert("Failed to suspend client. Please try again.");
    }
  };

  const handleReinstateClient = async (clientId: string) => {
    try {
      console.log("Reinstating client with ID:", clientId);

      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/client/approval?user_id=${clientId}&is_client_approved=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let responseData;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
        console.log("Reinstate Client API Response:", responseData);
      } else {
        const textResponse = await response.text();
        console.log("Reinstate Client API Text Response:", textResponse);

        if (response.ok) {
          responseData = { success: true };
        } else {
          throw new Error(`Non-JSON response: ${textResponse}`);
        }
      }

      if (responseData.success) {
        alert("Client reinstated successfully!");
        await loadClients(currentPage);
        await loadClientStats();
      } else {
        throw new Error(responseData.message || "Failed to reinstate client");
      }
    } catch (error) {
      console.error("Failed to reinstate client:", error);
      alert("Failed to reinstate client. Please try again.");
    }
  };

  const handleSendMessage = async (clientId: string, message: string) => {
    try {
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const url = `https://tasksfy.com/v1/web/admin/message/user/by/id/send?user_id=${clientId}&message=${encodeURIComponent(
        message
      )}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: clientId,
          message: message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Message sent successfully:", result);
        alert("Message sent successfully!");
        return true;
      } else {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
        throw new Error(errorData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      return false;
    }
  };

  if (loading && allClients.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading clients...</p>
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
              Clients Account Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {displayedClients.length} of {totalItems} clients
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <ClientsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalClients={allClients.length}
              filteredCount={totalItems}
            />
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ClientsTable
          clients={displayedClients}
          onSuspendClient={handleSuspendClient}
          onReinstateClient={handleReinstateClient}
          onSendMessage={handleSendMessage}
        />
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
            hasNextPage={!!nextPage || currentPage < totalPages}
            hasPrevPage={!!prevPage || currentPage > 1}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {allClients.length === 0
              ? "No clients have registered yet. Clients will appear here once they create accounts."
              : "No clients match your current filters. Try adjusting your search criteria."}
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