"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Shield,
  Camera,
  Upload,
  FileText,
  Download,
} from "lucide-react";
import { VerificationRequest, VerificationStage } from "@/types/verification";

interface VerificationDetailsProps {
  verification: VerificationRequest;
  onStageApproval: (verificationId: string, stage: VerificationStage) => void;
  onStageRejection: (
    verificationId: string,
    stage: VerificationStage,
    reason: string
  ) => void;
  onFinalVerification: (
    verificationId: string,
    approve: boolean,
    reason?: string
  ) => void;
}

export default function VerificationDetails({
  verification,
  onStageApproval,
  onStageRejection,
  onFinalVerification,
}: VerificationDetailsProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleStageAction = async (
    stage: VerificationStage,
    approve: boolean
  ) => {
    if (approve) {
      await onStageApproval(verification._id, stage);
    } else {
      const reason = prompt(
        `Please provide a reason for rejecting ${getStageName(stage)}:`
      );
      if (reason) {
        await onStageRejection(verification._id, stage, reason);
      }
    }
  };

  const handleFinalAction = async (approve: boolean) => {
    if (approve) {
      await onFinalVerification(verification._id, true);
    } else {
      const reason = prompt(
        "Please provide a reason for rejecting final verification:"
      );
      if (reason) {
        await onFinalVerification(verification._id, false, reason);
      }
    }
  };

  const getStageName = (stage: VerificationStage) => {
    const names = {
      stage3: "Facial Verification (Stage 3)",
      stage4: "Referral Verification (Stage 4)",
      final: "Final Verification",
    };
    return names[stage];
  };

  const getStageStatus = (stage: VerificationStage) => {
    return verification.stages[stage].status;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ml-2`}
      >
        {config.label}
      </span>
    );
  };

  const downloadDocument = (documentUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tasker Information Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          {verification.tasker.avatar_url ? (
            <Image
              src={verification.tasker.avatar_url}
              alt={verification.tasker.name}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-lg font-semibold">
                {verification.tasker.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {verification.tasker.name}
            </h2>
            <div className="mt-2 space-y-1 text-gray-600">
              <p>
                <strong>Email:</strong> {verification.tasker.email}
              </p>
              <p>
                <strong>Phone:</strong> {verification.tasker.phone}
              </p>
              <p>
                <strong>Applied:</strong>{" "}
                {new Date(verification.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                verification.overallStatus === "approved"
                  ? "bg-green-100 text-green-800"
                  : verification.overallStatus === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Overall:{" "}
              {verification.overallStatus.charAt(0).toUpperCase() +
                verification.overallStatus.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
          <p className="text-gray-700 leading-relaxed">{verification.about}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {verification.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Stages */}
      <div className="space-y-6">
        {/* Stage 3 - Facial Verification */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
              Facial Verification (Stage 3)
              {getStatusBadge(getStageStatus("stage3"))}
            </h4>
            {verification.stages.stage3.reviewedAt && (
              <div className="text-sm text-gray-500">
                Reviewed:{" "}
                {new Date(
                  verification.stages.stage3.reviewedAt
                ).toLocaleDateString()}
                {verification.stages.stage3.reviewedBy &&
                  ` by ${verification.stages.stage3.reviewedBy}`}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="text-center">
                {verification.stages.stage3.facialImage ? (
                  <Image
                    src={verification.stages.stage3.facialImage}
                    alt="Facial verification"
                    width={200}
                    height={200}
                    className="rounded-lg mx-auto"
                  />
                ) : (
                  <div className="py-8">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No facial image uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {getStageStatus("stage3") === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStageAction("stage3", true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Stage 3
                </button>
                <button
                  onClick={() => handleStageAction("stage3", false)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Stage 3
                </button>
              </div>
            )}

            {verification.stages.stage3.rejectionReason && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700">
                  <strong>Rejection Reason:</strong>{" "}
                  {verification.stages.stage3.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stage 4 - Referral Verification */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Referral Verification (Stage 4)
              {getStatusBadge(getStageStatus("stage4"))}
            </h4>
            {verification.stages.stage4.reviewedAt && (
              <div className="text-sm text-gray-500">
                Reviewed:{" "}
                {new Date(
                  verification.stages.stage4.reviewedAt
                ).toLocaleDateString()}
                {verification.stages.stage4.reviewedBy &&
                  ` by ${verification.stages.stage4.reviewedBy}`}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Referrals */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">
                Referrals ({verification.stages.stage4.referrals.length})
              </h5>
              {verification.stages.stage4.referrals.map((referral, index) => (
                <div
                  key={referral._id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <p>
                      <strong>Name:</strong> {referral.name}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {referral.relationship}
                    </p>
                    <p>
                      <strong>Phone:</strong> {referral.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Good Conduct Document */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2">
                Good Conduct Document
              </h5>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                {verification.stages.stage4.conductDocument ? (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-700">Conduct document uploaded</p>
                    <button
                      onClick={() =>
                        downloadDocument(
                          verification.stages.stage4.conductDocument!,
                          "good-conduct-document.pdf"
                        )
                      }
                      className="flex items-center justify-center mx-auto mt-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Document
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No conduct document uploaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {getStageStatus("stage4") === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStageAction("stage4", true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Stage 4
                </button>
                <button
                  onClick={() => handleStageAction("stage4", false)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Stage 4
                </button>
              </div>
            )}

            {verification.stages.stage4.rejectionReason && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700">
                  <strong>Rejection Reason:</strong>{" "}
                  {verification.stages.stage4.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Final Verification */}
        <div className="border-2 border-yellow-400 rounded-lg p-6 bg-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-yellow-600" />
              Final Verification
              <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                FINAL STEP
              </span>
            </h4>
            <div className="flex items-center space-x-4">
              {verification.stages.final.reviewedAt && (
                <div className="text-sm text-gray-500">
                  Reviewed:{" "}
                  {new Date(
                    verification.stages.final.reviewedAt
                  ).toLocaleDateString()}
                  {verification.stages.final.reviewedBy &&
                    ` by ${verification.stages.final.reviewedBy}`}
                </div>
              )}
              {getStatusBadge(getStageStatus("final"))}
            </div>
          </div>

          <div className="bg-white border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-gray-700">
              This is the final and most important verification step. Approval
              here will fully verify the tasker and grant them access to the
              platform.
            </p>
          </div>

          {/* Stage Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-3 rounded-lg text-center ${
                getStageStatus("stage3") === "approved"
                  ? "bg-green-100 text-green-800"
                  : getStageStatus("stage3") === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <p className="font-semibold">Stage 3</p>
              <p>
                {getStageStatus("stage3").charAt(0).toUpperCase() +
                  getStageStatus("stage3").slice(1)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                getStageStatus("stage4") === "approved"
                  ? "bg-green-100 text-green-800"
                  : getStageStatus("stage4") === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <p className="font-semibold">Stage 4</p>
              <p>
                {getStageStatus("stage4").charAt(0).toUpperCase() +
                  getStageStatus("stage4").slice(1)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                getStageStatus("final") === "approved"
                  ? "bg-green-100 text-green-800"
                  : getStageStatus("final") === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <p className="font-semibold">Final</p>
              <p>
                {getStageStatus("final").charAt(0).toUpperCase() +
                  getStageStatus("final").slice(1)}
              </p>
            </div>
          </div>

          {getStageStatus("final") === "pending" && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleFinalAction(true)}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Verify Tasker Completely
              </button>
              <button
                onClick={() => handleFinalAction(false)}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Tasker Verification
              </button>
            </div>
          )}

          {verification.stages.final.rejectionReason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">
                <strong>Rejection Reason:</strong>{" "}
                {verification.stages.final.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
