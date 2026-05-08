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
  const [applications, setApplications] = useState<Tasker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    loadApplications(1);
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

  const loadApplications = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build URL with pagination and filters
      let url = `https://tasksfy.com/v1/web/admin/taskersWithReviews?page=${page}&limit=${itemsPerPage}`;
      
      // Add status filter if needed
      if (selectedStatus !== "all") {
        url += `&status=${selectedStatus}`;
      }
      
      // Add search query if needed
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      console.log("Applications API Response:", data);

      if (data.success && data.taskersWithReviewsAndSkills) {
        // Set pagination info
        setNextPage(data.nextPage);
        setPrevPage(data.prevPage);
        setCurrentPage(page);
        
        // Transform the API response to match our Tasker interface
        const transformedApplications = data.taskersWithReviewsAndSkills.map((item: any) => {
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

        setApplications(transformedApplications);
        
        // Calculate total items (you might need to get this from API response)
        // If API doesn't return total count, you might need to calculate from filtered data
        setTotalItems(transformedApplications.length);
        
        // Calculate total pages based on response
        // If API returns total count, use that. Otherwise, assume there's a next page
        if (data.totalCount) {
          const newTotalPages = Math.ceil(data.totalCount / itemsPerPage);
          setTotalPages(newTotalPages);
          setTotalItems(data.totalCount);
        } else {
          // If no total count from API, we'll just set total pages based on nextPage
          setTotalPages(page + (data.nextPage ? 1 : 0));
        }
      } else {
        console.error("API response structure unexpected:", data);
        throw new Error(data.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    // If we're going to a page that requires new data from API
    if (page > currentPage && nextPage) {
      await loadApplications(page);
    } else if (page < currentPage && prevPage) {
      await loadApplications(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleNextPage = async () => {
    if (nextPage) {
      await loadApplications(nextPage);
    }
  };

  const handlePrevPage = async () => {
    if (prevPage) {
      await loadApplications(prevPage);
    }
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
          await loadApplications(currentPage);
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
          await loadApplications(currentPage);
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // Reload with new search query
    loadApplications(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    // Reload with new status filter
    loadApplications(1);
  };

  // Calculate counts (you might need separate API calls for these)
  const pendingCount = 0; // You'll need to get these from API or separate endpoint
  const approvedCount = 0;
  const totalCount = 0;

  if (loading && applications.length === 0) {
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
              Showing {applications.length} applications
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

      {/* Applications Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ApplicationsTable
          applications={applications}
          onApproveApplication={handleApproveApplication}
          onRejectApplication={handleRejectApplication}
        />
      </div>

      {/* Pagination */}
      {(nextPage || prevPage) && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            hasNextPage={!!nextPage}
            hasPrevPage={!!prevPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && !loading && (
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
            No tasker applications match your current criteria.
          </p>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2026.
      </div>
    </div>
  );
}