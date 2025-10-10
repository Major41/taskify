// app/api/admin/clients/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const clients = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            isTasker: false,
          },
        },
        {
          $lookup: {
            from: "acceptedrequests",
            localField: "_id",
            foreignField: "client",
            as: "clientRequests",
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "client_id",
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
            latitude: 1,
            longitude: 1,
            referralId: 1,
            walletBalance: 1,
            walletId: 1,
            withdrawStatus: 1,
            referrerId: 1,
            dateOfVerificationApplicationRequest: 1,

            // Client statistics
            pendingTasks: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "in_negotiation"] },
                },
              },
            },
            inNegotiation: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "in_negotiation"] },
                },
              },
            },
            ongoingTasks: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "ongoing"] },
                },
              },
            },
            completedTasks: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "completed"] },
                },
              },
            },
            cancelledTasks: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "canceled"] },
                },
              },
            },
            expiredTasks: {
              $size: {
                $filter: {
                  input: "$clientRequests",
                  as: "request",
                  cond: { $eq: ["$$request.task_status", "expired"] },
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
                  comment: "$$review.comment",
                  rating: "$$review.rating",
                  createdAt: "$$review.createdAt",
                  tasker: "$$review.tasker_name",
                },
              },
            },

            // Status fields for frontend compatibility
            is_approved: {
              $cond: {
                if: { $eq: ["$isPhone_number_verified", true] },
                then: true,
                else: false,
              },
            },
            is_accepting_requests: true, // Clients can always accept requests
            client_average_rating: "$client_average_rating",
            client_complete_tasks: "$client_complete_tasks",
            appliedAt: {
              $cond: {
                if: { $gt: ["$dateOfVerificationApplicationRequest", 0] },
                then: { $toDate: "$dateOfVerificationApplicationRequest" },
                else: "$_id",
              },
            },
            updatedAt: "$$ROOT._id",
          },
        },
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: clients,
      message: "Clients fetched successfully",
    });
  } catch (error) {
    console.error("Clients fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
        data: [],
      },
      { status: 500 }
    );
  }
}
