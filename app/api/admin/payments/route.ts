// app/api/admin/payments/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all transactions with populated user and request information
    const payments = await db
      .collection("transactions") // Using transactions collection instead of payments
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $lookup: {
            from: "requests",
            localField: "related_request",
            foreignField: "_id",
            as: "requestInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$requestInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            user: {
              _id: "$userInfo._id",
              name: "$userInfo.first_name",
              phone: "$userInfo.phone_number",
              avatar_url: "$userInfo.avatar_url",
            },
            amount: "$amountPaid",
            type: "$transactionType",
            status: 1,
            payment_method: 1,
            reference: 1,
            phone_number: "$from",
            description: 1,
            related_request: {
              _id: "$requestInfo._id",
              requestNumber: "$requestInfo.receipt_no",
              description: "$requestInfo.task_description",
            },
            mpesa_response: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: payments,
      message: "Payments fetched successfully",
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payments",
        data: [],
      },
      { status: 500 }
    );
  }
}
