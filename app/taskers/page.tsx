// app/taskers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TaskersTable from "@/components/Taskers/TaskersTable";
import TaskersFilters from "@/components/Taskers/TaskersFilters";
import Pagination from "@/components/Clients/Pagination"; // Reuse the same Pagination component
import { Tasker, TaskerStats } from "@/types/tasker";
import { useAuth } from "@/contexts/AuthContext";

export default function TaskersPage() {
  const { token } = useAuth();
  const [allTaskers, setAllTaskers] = useState<Tasker[]>([]); // Store all fetched taskers
  const [displayedTaskers, setDisplayedTaskers] = useState<Tasker[]>([]); // Taskers to display on current page
  const [stats, setStats] = useState<TaskerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "suspended"
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
    loadTaskers(1);
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ["all", "active", "suspended"].includes(filter)) {
      setSelectedStatus(filter as "all" | "active" | "suspended");
    }
  }, [searchParams]);

  // Apply filters whenever allTaskers, searchQuery, or selectedStatus changes
  useEffect(() => {
    filterAndPaginateTaskers();
  }, [allTaskers, searchQuery, selectedStatus, currentPage]);

  const loadTaskers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/taskersWithReviews?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch taskers");
      }

      const data = await response.json();
      console.log("Taskers API Response:", data);

      if (data.success && data.taskersWithReviewsAndSkills) {
        // Set pagination info
        setNextPage(data.nextPage);
        setPrevPage(data.prevPage);
        
        // Transform the API response to match our Tasker interface
        const transformedTaskers = data.taskersWithReviewsAndSkills.map(
          (tasker: any) => ({
            id: tasker.tasker.tasker_id,
            name:
              `${tasker.tasker.user?.first_name || ""} ${
                tasker.tasker.user?.last_name || ""
              }`.trim() || "Unknown Tasker",
            email: tasker.tasker.user?.email || "No email",
            phone: tasker.tasker.user?.phone_number || "No phone",
            profile_picture: tasker.tasker.user?.profile_url,
            skills: tasker.skills || [],
            rating: tasker.tasker.tasker_average_rating || 0,
            completed_tasks: tasker.tasker.tasker_complete_tasks || 0,
            is_approved: tasker.tasker.is_approved || false,
            is_accepting_requests: tasker.tasker.is_accepting_requests || false,
            joined_date: tasker.tasker.tasker_reg_date,
            category: tasker.category || "",
            location: tasker.location || "",
            address: tasker.tasker.user?.address || "Not specified",
            verification_level1_status: tasker.tasker.user?.verification_level1_status || false,
            verification_level2_status: tasker.tasker.user?.verification_level2_status || false,
            verification_level3_status: tasker.tasker.user?.verification_level3_status || false,
            verification_level4_status: tasker.tasker.user?.verification_level4_status || false,
            verification_level5_status: tasker.tasker.user?.verification_level5_status || false,
            reviews: tasker.reviews || [],
            walletBalance: tasker.tasker.user?.walletBalance || 0,
            tasker_average_rating: tasker.tasker.tasker_average_rating || 0,
            isPhone_number_verified: tasker.tasker.user?.isPhone_number_verified || false,
          })
        );

        // Store the new taskers
        setAllTaskers(transformedTaskers);
        setCurrentPage(page);
      } else {
        throw new Error(data.message || "Failed to load taskers");
      }
    } catch (error) {
      console.error("Failed to load taskers:", error);
      setAllTaskers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateTaskers = () => {
    // First, filter the taskers
    let filtered = [...allTaskers];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tasker) =>
        selectedStatus === "active" ? tasker.is_approved : !tasker.is_approved
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tasker) =>
          tasker.name.toLowerCase().includes(query) ||
          tasker.phone.toLowerCase().includes(query) ||
          tasker.email.toLowerCase().includes(query) ||
          tasker.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          (tasker.category && tasker.category.toLowerCase().includes(query)) ||
          (tasker.location && tasker.location.toLowerCase().includes(query))
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
    
    setDisplayedTaskers(paginatedData);
  };

  const loadTaskerStats = async () => {
    try {
      // Calculate stats from the allTaskers data
      const totalTaskers = allTaskers.length;
      const activeTaskers = allTaskers.filter((t) => t.is_approved).length;
      const suspendedTaskers = allTaskers.filter((t) => !t.is_approved).length;
      const totalCompletedTasks = allTaskers.reduce(
        (sum, tasker) => sum + (tasker.completed_tasks || 0),
        0
      );
      const averageRating =
        allTaskers.length > 0
          ? allTaskers.reduce((sum, tasker) => sum + (tasker.rating || 0), 0) /
            allTaskers.length
          : 0;

      const calculatedStats: TaskerStats = {
        total: totalTaskers,
        active: activeTaskers,
        suspended: suspendedTaskers,
        completed_tasks: totalCompletedTasks,
        average_rating: parseFloat(averageRating.toFixed(1)),
        new_this_month: allTaskers.filter((t) => {
          const joinedDate = new Date(t.joined_date);
          const now = new Date();
          return (
            joinedDate.getMonth() === now.getMonth() &&
            joinedDate.getFullYear() === now.getFullYear()
          );
        }).length,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load tasker stats:", error);
    }
  };

  // Reload stats when allTaskers change
  useEffect(() => {
    if (allTaskers.length > 0) {
      loadTaskerStats();
    }
  }, [allTaskers]);

  const handlePageChange = async (page: number) => {
    // If we're going to a page that requires new data from API
    if (page > Math.ceil(allTaskers.length / itemsPerPage) && nextPage) {
      await loadTaskers(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleNextPage = async () => {
    if (nextPage) {
      await loadTaskers(nextPage);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = async () => {
    if (prevPage) {
      await loadTaskers(prevPage);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSuspendTasker = async (taskerId: string, reason: string) => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/approval?tasker_id=${taskerId}&is_approved=false&reason=${encodeURIComponent(
          reason
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadTaskers(currentPage);
        await loadTaskerStats();
        alert("Tasker suspended successfully!");
      } else {
        throw new Error("Failed to suspend tasker");
      }
    } catch (error) {
      console.error("Failed to suspend tasker:", error);
      alert("Failed to suspend tasker. Please try again.");
    }
  };

  const handleReinstateTasker = async (taskerId: string) => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/approval?tasker_id=${taskerId}&is_approved=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadTaskers(currentPage);
        await loadTaskerStats();
        alert("Tasker reinstated successfully!");
      } else {
        throw new Error("Failed to reinstate tasker");
      }
    } catch (error) {
      console.error("Failed to reinstate tasker:", error);
      alert("Failed to reinstate tasker. Please try again.");
    }
  };

  if (loading && allTaskers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading taskers...</p>
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
              Taskers Account Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {displayedTaskers.length} of {totalItems} taskers
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <TaskersFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalTaskers={allTaskers.length}
              filteredCount={totalItems}
            />
          </div>
        </div>
      </div>

      {/* Taskers Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <TaskersTable
          taskers={displayedTaskers}
          onSuspendTasker={handleSuspendTasker}
          onReinstateTasker={handleReinstateTasker}
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
            No taskers found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {allTaskers.length === 0
              ? "No taskers have registered yet. Taskers will appear here once they create accounts."
              : "No taskers match your current filters. Try adjusting your search criteria."}
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