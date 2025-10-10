// app/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientsTable from "@/components/Clients/ClientsTable";
import ClientsFilters from "@/components/Clients/ClientsFilters";
import ClientStatsCards from "@/components/Clients/ClientStatsCards";
import { Client, ClientStats } from "@/types/client";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "suspended"
  >("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadClients();
    loadClientStats();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ["all", "active", "suspended"].includes(filter)) {
      setSelectedStatus(filter as "all" | "active" | "suspended");
    }
  }, [searchParams]);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, selectedStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/clients");

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.data);
      } else {
        throw new Error(data.message || "Failed to load clients");
      }
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientStats = async () => {
    try {
      const response = await fetch("/api/admin/clients/stats");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load client stats:", error);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((client) =>
        selectedStatus === "active" ? client.is_approved : !client.is_approved
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
          client.address.toLowerCase().includes(query)
      );
    }

    setFilteredClients(filtered);
  };

  const handleSuspendClient = async (clientId: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/clients/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          action: "suspend",
          reason,
        }),
      });

      if (response.ok) {
        await loadClients();
        await loadClientStats();
      }
    } catch (error) {
      console.error("Failed to suspend client:", error);
    }
  };

  const handleReinstateClient = async (clientId: string) => {
    try {
      const response = await fetch("/api/admin/clients/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          action: "reinstate",
        }),
      });

      if (response.ok) {
        await loadClients();
        await loadClientStats();
      }
    } catch (error) {
      console.error("Failed to reinstate client:", error);
    }
  };

  const handleSendMessage = async (clientId: string, message: string) => {
    try {
      const response = await fetch("/api/admin/clients/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          message,
        }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to send message:", error);
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
              {filteredClients.length} clients found
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

      {/* Client Statistics */}
      {stats && <ClientStatsCards stats={stats} />}

      {/* Clients Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ClientsTable
          clients={filteredClients}
          onSuspendClient={handleSuspendClient}
          onReinstateClient={handleReinstateClient}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
