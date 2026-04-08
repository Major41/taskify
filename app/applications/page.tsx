"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApplicationsTable from "@/components/Applications/ApplicationsTable";
import ApplicationsFilters from "@/components/Applications/ApplicationsFilters";
import Pagination from "@/components/Clients/Pagination";
import { useAuth } from "@/contexts/AuthContext";

interface Tasker {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_url?: string;
  is_approved: boolean;
  isTasker: boolean;
  skills?: Array<{
    skill_name: string;
    experience_level: string;
  }>;
  category?: string;
  created_at: string;
  avatar_url?: string;
  status: string;
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [allApplications, setAllApplications] = useState<Tasker[]>([]);
  const [displayedApplications, setDisplayedApplications] = useState<Tasker[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (
      filter &&
      (filter === "all" || ["pending", "approved"].includes(filter))
    ) {
      setSelectedStatus(filter);
    }
  }, [searchParams]);

  // Apply filters and pagination whenever data or filters change
  useEffect(() => {
    filterAndPaginateApplications();
  }, [allApplications, searchQuery, selectedStatus, currentPage]);

  // Helper function to get status from is_approved field
  const getApplicationStatus = (tasker: Tasker) => {
    return tasker.is_approved ? "approved" : "pending";
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/taskersWithReviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      if (data.success && data.taskersWithReviewsAndSkills) {
        // Transform the API response to match our Tasker interface
        const taskers = data.taskersWithReviewsAndSkills.map((item: any) => {
          const tasker = item.tasker;
          const user = tasker.user;

          return {
            user_id: tasker.tasker_id,
            first_name: user?.first_name || "Unknown",
            last_name: user?.last_name || "User",
            email: user?.email || "No email",
            phone_number: user?.phone_number || "No phone",
            profile_url: user?.profile_url,
            is_approved: tasker.is_approved || false,
            isTasker: user?.isTasker || false,
            skills: item.skills || [],
            category: tasker.category || "General",
            created_at: tasker?.tasker_reg_date || new Date().toISOString(),
            avatar_url: user?.profile_url,
            status: tasker?.user?.tasker_application_status,
            about: tasker.tasker_about,
            idImages: {
              passport: tasker.passport_photo,
              id_front: tasker.id_card_front,
              id_back: tasker.id_card_back,
            },
            workImages: tasker.job_images,
          };
        });

        setAllApplications(taskers);
      } else {
        console.error("API response structure unexpected:", data);
        throw new Error(data.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      setAllApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateApplications = () => {
    // First, filter the applications
    let filtered = [...allApplications];

    // Filter by status - use is_approved field to determine status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tasker) => {
        const status = getApplicationStatus(tasker);
        return status === selectedStatus;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tasker) =>
          tasker.first_name?.toLowerCase().includes(query) ||
          tasker.last_name?.toLowerCase().includes(query) ||
          tasker.phone_number?.toLowerCase().includes(query) ||
          tasker.email?.toLowerCase().includes(query) ||
          (tasker.skills &&
            tasker.skills.some(
              (skill) =>
                skill.skill_name &&
                skill.skill_name.toLowerCase().includes(query),
            )) ||
          (tasker.category && tasker.category.toLowerCase().includes(query)),
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
    
    setDisplayedApplications(paginatedData);
  };

  const handleApproveApplication = async (taskerId: string) => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/application/approval?tasker_id=${taskerId}&is_approved=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Refresh applications to get updated status
          await loadApplications();
          alert("Application approved successfully!");
        } else {
          throw new Error(data.message || "Failed to approve application");
        }
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleRejectApplication = async (taskerId: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;

    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/application/approval?tasker_id=${taskerId}&is_approved=false`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Refresh applications to get updated status
          await loadApplications();
          alert("Application rejected successfully!");
        } else {
          throw new Error(data.message || "Failed to reject application");
        }
      } else {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application. Please try again.");
    }
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when status filter changes
  };

  const pendingCount = allApplications.filter((a) => !a.is_approved).length;
  const approvedCount = allApplications.filter((a) => a.is_approved).length;
  const totalCount = allApplications.length;

  if (loading && allApplications.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
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
              Tasker Application Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {displayedApplications.length} of {totalItems} applications
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <ApplicationsFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
              totalApplications={totalCount}
              filteredCount={totalItems}
            />
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ApplicationsTable
          applications={displayedApplications}
          onApproveApplication={handleApproveApplication}
          onRejectApplication={handleRejectApplication}
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
            No applications found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {totalCount === 0
              ? "No tasker applications have been submitted yet. Applications will appear here once users apply to become taskers."
              : "No applications match your current filters. Try adjusting your search criteria."}
          </p>
          {(searchQuery || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Table Footer Info */}
      {displayedApplications.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {displayedApplications.length} of {totalItems} applications
          </div>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full mr-1"></div>
              Pending: {pendingCount}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-1"></div>
              Approved: {approvedCount}
            </span>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2026.
      </div>
    </div>
  );
}