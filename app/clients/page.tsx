// app/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientsTable from "@/components/Clients/ClientsTable";
import ClientsFilters from "@/components/Clients/ClientsFilters";
import { Client, ClientStats } from "@/types/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientsPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadClients();
    loadClientStats();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ["all", "active", "inactive"].includes(filter)) {
      setSelectedStatus(filter as "all" | "active" | "inactive");
    }
  }, [searchParams]);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, selectedStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://tasksfy.com/v1/web/admin/clientsWithReviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      console.log("Clients API Response:", data.clientsWithReviews); // Debug log

      if (data.clientsWithReviews) {
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
          is_approved: user.user.is_approved || true, // Clients are typically approved by default
          joined_date: user.user.dateOfRegistration,
          total_requests: user.user.total_requests || 0,
          completed_requests: user.user.completed_requests || 0,
          is_active: user.user.is_active !== false, // Default to active if not specified
          isPhone_number_verified: user.user.isPhone_number_verified || false,
          reviews:user.client_reviews,
          client_average_rating:user.user.client_average_rating,
        }));

        setClients(transformedClients);
      } else {
        throw new Error(data.message || "Failed to load clients");
      }
    } catch (error) {
      console.error("Failed to load clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientStats = async () => {
    try {
      // Calculate stats from the clients data
      const totalClients = clients.length;
      const activeClients = clients.filter((c) => c.is_active).length;
      const inactiveClients = clients.filter((c) => !c.is_active).length;
      const totalRequests = clients.reduce(
        (sum, client) => sum + (client.total_requests || 0),
        0
      );
      const completedRequests = clients.reduce(
        (sum, client) => sum + (client.completed_requests || 0),
        0
      );

      const calculatedStats: ClientStats = {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        total_requests: totalRequests,
        completed_requests: completedRequests,
        new_this_month: clients.filter((c) => {
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

  // Reload stats when clients change
  useEffect(() => {
    if (clients.length > 0) {
      loadClientStats();
    }
  }, [clients]);

  const filterClients = () => {
    let filtered = clients;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((client) =>
        selectedStatus === "active" ? client.is_active : !client.is_active
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

    setFilteredClients(filtered);
  };

 const handleSendMessage = async (clientId: string, message: string) => {
   try {
     const token =
       localStorage.getItem("authToken") || localStorage.getItem("token");

     if (!token) {
       throw new Error("Authentication token not found");
     }

     // Construct the URL with query parameters
     const url = `https://tasksfy.com/v1/web/admin/message/user/by/id/send?user_id=${clientId}&message=${encodeURIComponent(
       message
     )}`;

     const response = await fetch(url, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       // Since the message is in the URL, you might not need a body
       // But if the API expects a body, you can include it
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
  if (loading) {
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
              Showing {filteredClients.length} of {clients.length} clients
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <ClientsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalClients={clients.length}
              filteredCount={filteredClients.length}
            />
          </div>
        </div>
      </div>
      
      {/* Clients Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ClientsTable
          clients={filteredClients}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && !loading && (
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
            {clients.length === 0
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
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
