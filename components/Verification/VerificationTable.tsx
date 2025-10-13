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
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    stage: null,
    taskerId: null,
  });

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
    return status === "Verified" ? "Verified" : "Unverified";
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

  // Open approval modal with stage-specific images
  const openApprovalModal = (taskerId, stage, verification) => {
    setApprovalModal({ open: true, stage, taskerId, verification });
  };

  // Close approval modal
  const closeApprovalModal = () => {
    setApprovalModal({
      open: false,
      stage: null,
      taskerId: null,
      verification: null,
    });
  };

  // Handle stage approval with confirmation
  const handleStageApproval = async (taskerId, stage) => {
    await onStageApproval(taskerId, stage);
    closeApprovalModal();
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

      case "stage4": // Good Conduct Verificatio
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
                Date Approved
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
                    <div className="text-sm text-gray-900">
                      {verification.overallStatus === "approved"
                        ? formatDate(verification.updatedAt)
                        : "N/A"}
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
                    <td colSpan={7} className="px-6 py-4">
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
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Facial Verification (Stage 3)
                          </h4>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                getVerificationStatus(
                                  "stage3",
                                  verification
                                ) === "Verified"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              Status:{" "}
                              {getVerificationStatus("stage3", verification)}
                            </span>
                            {getVerificationStatus("stage3", verification) ===
                              "Unverified" && (
                              <div className="space-x-2">
                                <button
                                  onClick={() =>
                                    openApprovalModal(
                                      verification.tasker._id,
                                      "stage3",
                                      verification
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve Stage 3
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Good Conduct Verification (Stage 4) */}
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Good Conduct Verification (Stage 4)
                          </h4>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                getVerificationStatus(
                                  "stage4",
                                  verification
                                ) === "Verified"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              Status:{" "}
                              {getVerificationStatus("stage4", verification)}
                            </span>
                            {getVerificationStatus("stage4", verification) ===
                              "Unverified" && (
                              <div className="space-x-2">
                                <button
                                  onClick={() =>
                                    openApprovalModal(
                                      verification.tasker._id,
                                      "stage4",
                                      verification
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve Stage 4
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Office Appointment Verification (Final) */}
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Office Appointment Verification (Final)
                          </h4>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                getVerificationStatus(
                                  "stage5",
                                  verification
                                ) === "Verified"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              Status:{" "}
                              {getVerificationStatus("stage5", verification)}
                            </span>
                            {getVerificationStatus("stage5", verification) ===
                              "Unverified" && (
                              <div className="space-x-2">
                                <button
                                  onClick={() =>
                                    openApprovalModal(
                                      verification.tasker._id,
                                      "stage5",
                                      verification
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verify Tasker Fully
                                </button>
                                <button
                                  onClick={() =>
                                    handleFinalAction(
                                      verification.tasker._id,
                                      false
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject Tasker Verification
                                </button>
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

      {/* Stage Approval Modal with Images */}
      {approvalModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {approvalModal.stage === "stage3" &&
                    "Facial Verification Approval"}
                  {approvalModal.stage === "stage4" &&
                    "Good Conduct Verification Approval"}
                  {approvalModal.stage === "stage5" &&
                    "Final Verification Approval"}
                </h2>
                <button
                  onClick={closeApprovalModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stage-specific description */}
              <div className="mb-6">
                <p className="text-gray-700">
                  {approvalModal.stage === "stage3" &&
                    "Please review the identification documents before approving facial verification."}
                  {approvalModal.stage === "stage4" &&
                    "Please review the work samples and conduct verification before approval."}
                  {approvalModal.stage === "stage5" &&
                    "Please review all verification materials before final approval."}
                </p>
              </div>

              {/* Images Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Images
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getStageImages(
                    approvalModal.stage,
                    approvalModal.verification
                  ).map((image, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {image.label}
                      </p>
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() =>
                          openImageViewer(image.url, image.type, index)
                        }
                      >
                        <Image
                          src={image.url}
                          alt={image.label}
                          width={200}
                          height={150}
                          className="rounded-lg border object-cover w-full h-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {getStageImages(approvalModal.stage, approvalModal.verification)
                  .length === 0 && (
                  <div className="text-center py-8 border border-gray-200 rounded-lg">
                    <p className="text-gray-500">
                      No images available for this stage
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  onClick={closeApprovalModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStageApproval(
                      approvalModal.taskerId,
                      approvalModal.stage
                    )
                  }
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve{" "}
                  {approvalModal.stage === "stage3" && "Facial Verification"}
                  {approvalModal.stage === "stage4" && "Good Conduct"}
                  {approvalModal.stage === "stage5" && "Final Verification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
