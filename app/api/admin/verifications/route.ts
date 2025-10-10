// app/api/admin/verifications/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const verifications = await db
      .collection("acceptedRequests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "tasker_id",
            foreignField: "_id",
            as: "taskerInfo",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "clientInfo",
          },
        },
        {
          $lookup: {
            from: "requests",
            localField: "request",
            foreignField: "_id",
            as: "requestInfo",
          },
        },
        {
          $unwind: "$taskerInfo",
        },
        {
          $unwind: "$clientInfo",
        },
        {
          $unwind: "$requestInfo",
        },
        {
          $project: {
            tasker: {
              _id: "$taskerInfo._id",
              name: "$taskerInfo.first_name",
              phone: "$taskerInfo.phone_number",
              email: "$taskerInfo.email",
              avatar_url: "$taskerInfo.avatar_url",
            },
            client: {
              _id: "$clientInfo._id",
              name: "$clientInfo.first_name",
              phone: "$clientInfo.phone_number",
              email: "$clientInfo.email",
            },
            request: {
              _id: "$requestInfo._id",
              description: "$requestInfo.task_description",
              budget: "$requestInfo.budget",
              category: "$requestInfo.category",
            },
            agreed_amount: 1,
            task_status: "$task_status",
            payment_status: 1,
            completion_date: 1,
            cancellation_reason: 1,
            client_rating: 1,
            tasker_rating: 1,
            client_review: 1,
            tasker_review: "$tasker_rating_feedback",
            overallStatus: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$task_status", "completed"] },
                    then: "approved",
                  },
                  {
                    case: { $eq: ["$task_status", "canceled"] },
                    then: "rejected",
                  },
                ],
                default: "pending",
              },
            },
            appliedAt: "$createdAt",
            updatedAt: 1,
          },
        },
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: verifications,
      message: "Verification requests fetched successfully",
    });
  } catch (error) {
    console.error("Verifications fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch verification requests",
        data: [],
      },
      { status: 500 }
    );
  }
}
