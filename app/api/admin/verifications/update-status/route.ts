// app/api/admin/verifications/update-status/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { verificationId, status, reason } = await request.json();

    if (!verificationId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification ID and status are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Map verification status to task status
    const taskStatusMap = {
      approved: "completed",
      rejected: "canceled",
      pending: "in_negotiation",
    };

    const updateData: any = {
      task_status: taskStatusMap[status as keyof typeof taskStatusMap],
      updatedAt: new Date(),
    };

    if (status === "rejected" && reason) {
      updateData.cancellation_reason = reason;
    }

    if (status === "approved") {
      updateData.completion_date = new Date();
    }

    const result = await db
      .collection("acceptedrequests")
      .updateOne({ _id: new ObjectId(verificationId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${status} successfully`,
    });
  } catch (error) {
    console.error("Update verification status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update verification status",
      },
      { status: 500 }
    );
  }
}
