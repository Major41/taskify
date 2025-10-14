"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  Users,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function VerificationTable({
  verifications,
  onStageApproval,
  onFinalVerification,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const toggleDropdown = (verificationId) => {
    setActiveDropdown(
      activeDropdown === verificationId ? null : verificationId
    );
  };

  const toggleRowExpansion = (verificationId) => {
    setExpandedRow(expandedRow === verificationId ? null : verificationId);
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
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getVerificationStatus = (stage, verification) => {
    const status = verification.verification_stages?.[stage];

    // Handle different status values properly
    if (status === "Verified") {
      return "Verified";
    } else if (status === "Pending") {
      return "Pending";
    } else {
      return "Unverified";
    }
  };

  // Check if previous stages are verified for sequential flow
  const canVerifyStage = (stage, verification) => {
    switch (stage) {
      case "stage3":
        // Stage 3 can always be verified as it's the first in sequence
        return getVerificationStatus("stage3", verification) === "Pending";

      case "stage4":
        // Stage 4 can only be verified if Stage 3 is verified
        return (
          getVerificationStatus("stage3", verification) === "Verified" &&
          getVerificationStatus("stage4", verification) === "Pending"
        );

      case "stage5":
        // Stage 5 (Final) can only be verified if both Stage 3 and Stage 4 are verified
        return (
          getVerificationStatus("stage3", verification) === "Verified" &&
          getVerificationStatus("stage4", verification) === "Verified" &&
          getVerificationStatus("stage5", verification) === "Pending"
        );

      default:
        return false;
    }
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

  const handleStageApproval = async (taskerId, stage) => {
    await onStageApproval(taskerId, stage);
  };

  const handleFinalAction = async (taskerId, approve) => {
    await onFinalVerification(taskerId, approve);
  };

  // Get images for specific stage
  const getStageImages = (stage, verification) => {
    switch (stage) {
      case "stage3": // Facial Verification
        return [
          {
            url: verification.identification_images?.passport,
            label: "Passport Photo",
            type: "passport",
          },
          {
            url: verification.identification_images?.id_front,
            label: "ID Front",
            type: "id_front",
          },
          {
            url: verification.identification_images?.id_back,
            label: "ID Back",
            type: "id_back",
          },
        ].filter((img) => img.url && !img.url.includes("null"));

      case "stage4": // Good Conduct Verification
        return (
          verification.work_images
            ?.filter((img) => img && !img.includes("null"))
            .map((img, index) => ({
              url: img,
              label: `Work Sample ${index + 1}`,
              type: "work",
            })) || []
        );

      case "stage5": // Final Verification
        return [
          ...(verification.identification_images?.passport &&
          !verification.identification_images.passport.includes("null")
            ? [
                {
                  url: verification.identification_images.passport,
                  label: "Passport Photo",
                  type: "passport",
                },
              ]
            : []),
          ...(verification.identification_images?.id_front &&
          !verification.identification_images.id_front.includes("null")
            ? [
                {
                  url: verification.identification_images.id_front,
                  label: "ID Front",
                  type: "id_front",
                },
              ]
            : []),
          ...(verification.identification_images?.id_back &&
          !verification.identification_images.id_back.includes("null")
            ? [
                {
                  url: verification.identification_images.id_back,
                  label: "ID Back",
                  type: "id_back",
                },
              ]
            : []),
          ...(verification.work_images
            ?.filter((img) => img && !img.includes("null"))
            .map((img, index) => ({
              url: img,
              label: `Work Sample ${index + 1}`,
              type: "work",
            })) || []),
        ];

      default:
        return [];
    }
  };

  // Image display component - removed action buttons from individual images
  const ImageDisplay = ({ image }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = (e) => {
      console.error("Image failed to load:", image.url, e);
      setImageError(true);
    };

    const handleImageLoad = () => {
      console.log("Image loaded successfully:", image.url);
      setImageLoaded(true);
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="text-center">
          <h5 className="font-medium text-gray-900 mb-2">{image.label}</h5>

          <div
            className="cursor-pointer transform transition-transform hover:scale-105 mx-auto max-w-xs"
            onClick={() =>
              !imageError && openImageViewer(image.url, image.type)
            }
          >
            {!imageError ? (
              <div className="relative">
                <Image
                  src={image.url}
                  alt={image.label}
                  width={300}
                  height={200}
                  className="rounded-lg border object-cover w-full h-48"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-pulse text-gray-400">
                      Loading image...
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-center text-blue-600 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Click to view larger
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 w-full h-48 flex flex-col items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-red-600 text-sm">Failed to load image</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (verifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No verification requests found
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
            {verifications.map((verification) => (
              <React.Fragment key={verification._id}>
                <tr
                  className={`
                    hover:bg-gray-50/50 transition-colors cursor-pointer
                    ${
                      verification.overallStatus === "approved"
                        ? "bg-green-50/30"
                        : ""
                    }
                  `}
                  onClick={() => toggleRowExpansion(verification._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Image
                      src={
                        verification.tasker.avatar_url ||
                        "/assets/images/users/default-avatar.jpg"
                      }
                      alt={verification.tasker.name}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {verification.tasker.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.tasker.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(verification.appliedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(verification.overallStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {verification.overallStatus === "pending" ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalAction(verification.tasker._id, true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verify Tasker
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Verified</span>
                    )}
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedRow === verification._id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        {/* Profile Header */}
                        <div className="flex items-center space-x-4 mb-6">
                          <Image
                            src={
                              verification.tasker.avatar_url ||
                              "/assets/images/users/default-avatar.jpg"
                            }
                            alt={verification.tasker.name}
                            width={60}
                            height={60}
                            className="rounded-lg"
                          />
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {verification.tasker.name}
                            </h3>
                            <p className="text-gray-600">
                              {verification.tasker.phone}
                            </p>
                            <p className="text-gray-600">
                              {verification.tasker.email}
                            </p>
                          </div>
                        </div>

                        {/* About Section */}
                        {verification.tasker_about && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                              About
                            </h4>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                              {verification.tasker_about}
                            </p>
                          </div>
                        )}

                        {/* Facial Verification (Stage 3) */}
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Facial Verification (Stage 3)
                            </h4>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`text-sm ${
                                  getVerificationStatus(
                                    "stage3",
                                    verification
                                  ) === "Verified"
                                    ? "text-green-600"
                                    : getVerificationStatus(
                                        "stage3",
                                        verification
                                      ) === "Pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                Status:{" "}
                                {getVerificationStatus("stage3", verification)}
                              </span>
                              {canVerifyStage("stage3", verification) && (
                                <button
                                  onClick={() =>
                                    handleStageApproval(
                                      verification.tasker._id,
                                      "stage3"
                                    )
                                  }
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify Stage 3
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-4">
                              Identification Documents
                            </h5>
                            {getStageImages("stage3", verification).length >
                            0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getStageImages("stage3", verification).map(
                                  (image, index) => (
                                    <ImageDisplay key={index} image={image} />
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <p className="text-gray-500">
                                  No identification documents uploaded
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Good Conduct Verification (Stage 4) */}
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Good Conduct Verification (Stage 4)
                            </h4>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`text-sm ${
                                  getVerificationStatus(
                                    "stage4",
                                    verification
                                  ) === "Verified"
                                    ? "text-green-600"
                                    : getVerificationStatus(
                                        "stage4",
                                        verification
                                      ) === "Pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                Status:{" "}
                                {getVerificationStatus("stage4", verification)}
                              </span>
                              {canVerifyStage("stage4", verification) && (
                                <button
                                  onClick={() =>
                                    handleStageApproval(
                                      verification.tasker._id,
                                      "stage4"
                                    )
                                  }
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify Stage 4
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-4">
                              Work Samples
                            </h5>
                            {getStageImages("stage4", verification).length >
                            0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getStageImages("stage4", verification).map(
                                  (image, index) => (
                                    <ImageDisplay key={index} image={image} />
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <p className="text-gray-500">
                                  No work samples uploaded
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Office Appointment Verification (Final) */}
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Office Appointment Verification (Final)
                            </h4>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`text-sm ${
                                  getVerificationStatus(
                                    "stage5",
                                    verification
                                  ) === "Verified"
                                    ? "text-green-600"
                                    : getVerificationStatus(
                                        "stage5",
                                        verification
                                      ) === "Pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                Status:{" "}
                                {getVerificationStatus("stage5", verification)}
                              </span>
                              {canVerifyStage("stage5", verification) && (
                                <button
                                  onClick={() =>
                                    handleStageApproval(
                                      verification.tasker._id,
                                      "stage5"
                                    )
                                  }
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify Stage 5
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Information Paragraph */}
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                              <p className="text-gray-700">
                                This is the final and most important
                                verification step. Approval here will fully
                                verify the tasker and grant them access to the
                                platform.
                              </p>
                            </div>

                            {/* Stage Status Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div
                                className={`p-3 rounded-lg text-center ${
                                  getVerificationStatus(
                                    "stage3",
                                    verification
                                  ) === "Verified"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                <p className="font-semibold">Stage 3</p>
                                <p>
                                  {getVerificationStatus(
                                    "stage3",
                                    verification
                                  ) === "Verified"
                                    ? "✓ Verified"
                                    : "Pending"}
                                </p>
                              </div>
                              <div
                                className={`p-3 rounded-lg text-center ${
                                  getVerificationStatus(
                                    "stage4",
                                    verification
                                  ) === "Verified"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                <p className="font-semibold">Stage 4</p>
                                <p>
                                  {getVerificationStatus(
                                    "stage4",
                                    verification
                                  ) === "Verified"
                                    ? "✓ Verified"
                                    : "Pending"}
                                </p>
                              </div>
                              <div
                                className={`p-3 rounded-lg text-center ${
                                  getVerificationStatus(
                                    "stage5",
                                    verification
                                  ) === "Verified"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                <p className="font-semibold">Final</p>
                                <p>
                                  {getVerificationStatus(
                                    "stage5",
                                    verification
                                  ) === "Verified"
                                    ? "✓ Verified"
                                    : "Pending"}
                                </p>
                              </div>
                            </div>

                            {/* Show message if prerequisites not met */}
                            {getVerificationStatus("stage5", verification) ===
                              "Pending" &&
                              (getVerificationStatus("stage3", verification) !==
                                "Verified" ||
                                getVerificationStatus(
                                  "stage4",
                                  verification
                                ) !== "Verified") && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                  <p className="text-yellow-700">
                                    <strong>Prerequisites Required:</strong>{" "}
                                    Stage 3 and Stage 4 must be verified before
                                    final approval.
                                  </p>
                                </div>
                              )}

                            {/* Show success message if already verified */}
                            {getVerificationStatus("stage5", verification) ===
                              "Verified" && (
                              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                <p className="text-green-700">
                                  <strong>✓ Tasker Fully Verified:</strong> This
                                  tasker has been completely verified and
                                  granted platform access.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vetted & Verified Section */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Vetted & Verified by: System Administrator
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full Screen Image Viewer */}
      {imageViewerOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          {/* Close Button */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Display */}
          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
            <Image
              src={selectedImage.url}
              alt={selectedImage.label || "Verification Image"}
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
