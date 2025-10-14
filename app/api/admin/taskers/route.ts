// app/api/admin/taskers/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const taskers = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            isTasker: true,
          },
        },
        {
          $lookup: {
            from: "acceptedRequests",
            localField: "_id",
            foreignField: "tasker_id",
            as: "taskerRequests",
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "recipientId",
            as: "reviews",
          },
        },
        {
          $project: {
            _id: 1,
            name: {
              $concat: ["$first_name", " ", "$last_name"],
            },
            first_name: 1,
            last_name: 1,
            phone: "$phone_number",
            email: 1,
            avatar_url: "$profile_url",
            address: 1,
            gender: 1,
            isPhone_number_verified: 1,
            verified_identity_url: 1,
            client_average_rating: 1,
            client_complete_tasks: 1,
            isTasker: 1,
            tasker_application_status: 1,
            verification_level1_status: 1,
            verification_level2_status: 1,
            verification_level3_status: 1,
            verification_level4_status: 1,
            verification_level5_status: 1,
            latitude: 1,
            longitude: 1,
            referralId: 1,
            walletBalance: 1,
            walletId: 1,
            withdrawStatus: 1,
            referrerId: 1,
            dateOfVerificationApplicationRequest: 1,

            // Task statistics
            pendingTasks: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "in_negotiation"] },
                },
              },
            },
            inNegotiation: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "in_negotiation"] },
                },
              },
            },
            ongoingTasks: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "Ongoing"] },
                },
              },
            },
            completedTasks: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "Completed"] },
                },
              },
            },
            cancelledTasks: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "Canceled"] },
                },
              },
            },
            expiredTasks: {
              $size: {
                $filter: {
                  input: "$taskerRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "Expired"] },
                },
              },
            },

            // Reviews
            reviews: {
              $map: {
                input: "$reviews",
                as: "review",
                in: {
                  _id: "$$review._id",
                  comment: "$$review.feedback",
                  rating: "$$review.feedbackRatingStar",
                  createdAt: "$$review.feedbackDate",
                  client: "$$review.senderFName",
                },
              },
            },

            // Status fields for frontend compatibility
            is_approved: {
              $cond: {
                if: { $eq: ["$tasker_application_status", "Approved"] },
                then: true,
                else: false,
              },
            },
            is_accepting_requests: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$tasker_application_status", "Approved"] },
                    { $eq: ["$verification_level1_status", "Verified"] },
                    { $eq: ["$verification_level2_status", "Verified"] },
                  ],
                },
                then: true,
                else: false,
              },
            },
            tasker_average_rating: "$client_average_rating",
            tasker_complete_tasks: "$client_complete_tasks",
            appliedAt: {
              $cond: {
                if: { $gt: ["$dateOfVerificationApplicationRequest", 0] },
                then: { $toDate: "$dateOfVerificationApplicationRequest" },
                else: "$_id", // Fallback to creation date if no verification date
              },
            },
            updatedAt: "$$ROOT._id", // Using _id as fallback for updatedAt
          },
        },
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: taskers,
      message: "Taskers fetched successfully",
    });
  } catch (error) {
    console.error("Taskers fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch taskers",
        data: [],
      },
      { status: 500 }
    );
  }
}
