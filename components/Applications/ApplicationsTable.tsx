"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  MessageCircle,
  XCircle,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ApplicationsTable({
  applications,
  onApproveApplication,
  onRejectApplication,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const toggleDropdown = (applicationId) => {
    setActiveDropdown(activeDropdown === applicationId ? null : applicationId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  };

  // Open image viewer with specific image
  const openImageViewer = (imageUrl, imageType = "work", index = 0) => {
    setSelectedImage({ url: imageUrl, type: imageType, index });
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  // Close image viewer
  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  // Navigate to next image
  const nextImage = () => {
    if (!selectedApplication) return;

    const allImages = getAllImages(selectedApplication);
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(allImages[nextIndex]);
  };

  // Navigate to previous image
  const prevImage = () => {
    if (!selectedApplication) return;

    const allImages = getAllImages(selectedApplication);
    const prevIndex =
      (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(allImages[prevIndex]);
  };

  // Get all images from the application for navigation
  const getAllImages = (application) => {
    const images = [];

    // Add ID images
    if (
      application.idImages?.passport &&
      !application.idImages.passport.includes("null")
    ) {
      images.push({
        url: application.idImages.passport,
        type: "passport",
        label: "Passport Photo",
      });
    }
    if (
      application.idImages?.id_front &&
      !application.idImages.id_front.includes("null")
    ) {
      images.push({
        url: application.idImages.id_front,
        type: "id_front",
        label: "ID Front",
      });
    }
    if (
      application.idImages?.id_back &&
      !application.idImages.id_back.includes("null")
    ) {
      images.push({
        url: application.idImages.id_back,
        type: "id_back",
        label: "ID Back",
      });
    }

    // Add work images
    application.workImages?.forEach((image, index) => {
      if (image && !image.includes("null")) {
        images.push({
          url: image,
          type: "work",
          label: `Work Image ${index + 1}`,
        });
      }
    });

    return images;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!imageViewerOpen) return;

    switch (e.key) {
      case "Escape":
        closeImageViewer();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
      default:
        break;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No applications found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Application
              </th>
             
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr
                key={application._id}
                className={`
                  hover:bg-gray-50/50 transition-colors
                  ${application.status === "approved" ? "bg-green-50/30" : ""}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={
                      application.user.avatar_url ||
                      "/assets/images/users/default-avatar.jpg"
                    }
                    alt={application.user.name}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {application.user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {application.user.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(application.appliedAt)}
                  </div>
                </td>
               
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(application.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* Quick Actions for Pending Applications */}
                    {application.status === "pending" && (
                      <button
                        onClick={() => onApproveApplication(application._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </button>
                    )}

                    {/* View Details Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(application._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>

                      {activeDropdown === application._id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                viewApplicationDetails(application);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>

                            {application.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    onApproveApplication(application._id);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Application
                                </button>
                              </>
                            )}

                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message Applicant
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tasker Application Details
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-6">
                <Image
                  src={
                    selectedApplication.user.avatar_url ||
                    "/assets/images/users/default-avatar.jpg"
                  }
                  alt={selectedApplication.user.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedApplication.user.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedApplication.user.phone}
                  </p>
                  <p className="text-gray-600">
                    {selectedApplication.user.email}
                  </p>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.about || "No description provided."}
                </p>
              </div>

              {/* Skills Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Skills
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.skills?.map((skill, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900">
                        {skill.skill_name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {skill.category_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Experience: {skill.skill_experience}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rate: KSh {skill.work_rate_amount} per{" "}
                        {skill.work_rate_type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identification Images */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Identification Images
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Passport Photo
                    </p>
                    {selectedApplication.idImages?.passport &&
                    !selectedApplication.idImages.passport.includes("null") ? (
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() =>
                          openImageViewer(
                            selectedApplication.idImages.passport,
                            "passport",
                            0
                          )
                        }
                      >
                        <Image
                          src={selectedApplication.idImages.passport}
                          alt="Passport"
                          width={200}
                          height={150}
                          className="rounded-lg border object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      ID Front
                    </p>
                    {selectedApplication.idImages?.id_front &&
                    !selectedApplication.idImages.id_front.includes("null") ? (
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() =>
                          openImageViewer(
                            selectedApplication.idImages.id_front,
                            "id_front",
                            1
                          )
                        }
                      >
                        <Image
                          src={selectedApplication.idImages.id_front}
                          alt="ID Front"
                          width={200}
                          height={150}
                          className="rounded-lg border object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      ID Back
                    </p>
                    {selectedApplication.idImages?.id_back &&
                    !selectedApplication.idImages.id_back.includes("null") ? (
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() =>
                          openImageViewer(
                            selectedApplication.idImages.id_back,
                            "id_back",
                            2
                          )
                        }
                      >
                        <Image
                          src={selectedApplication.idImages.id_back}
                          alt="ID Back"
                          width={200}
                          height={150}
                          className="rounded-lg border object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Previous Work Images */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Previous Work Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedApplication.workImages?.map((image, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Image {index + 1}
                      </p>
                      {image && !image.includes("null") ? (
                        <div
                          className="cursor-pointer transform transition-transform hover:scale-105"
                          onClick={() =>
                            openImageViewer(image, "work", 3 + index)
                          }
                        >
                          <Image
                            src={image}
                            alt={`Work sample ${index + 1}`}
                            width={150}
                            height={120}
                            className="rounded-lg border object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === "pending" && (
                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    onClick={() => {
                      onApproveApplication(selectedApplication._id);
                      closeDetailsModal();
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {imageViewerOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {getAllImages(selectedApplication).length}
          </div>

          {/* Image Display */}
          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
            <Image
              src={selectedImage.url}
              alt={selectedImage.label || "Application Image"}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              priority
            />
          </div>

          {/* Image Label */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
            <p className="text-lg font-medium">{selectedImage.label}</p>
          </div>
        </div>
      )}
    </>
  );
}
