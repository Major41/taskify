// components/Clients/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Showing results text */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            transition-colors border
            ${
              hasPrevPage
                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (typeof page === "number") {
                  onPageChange(page);
                }
              }}
              disabled={typeof page !== "number"}
              className={`
                min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium
                transition-colors
                ${
                  typeof page !== "number"
                    ? "text-gray-500 cursor-default"
                    : page === currentPage
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            transition-colors border
            ${
              hasNextPage
                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
