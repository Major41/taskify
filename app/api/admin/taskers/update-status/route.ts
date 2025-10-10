// app/api/admin/taskers/update-status/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { taskerId, action, reason } = await request.json();

    if (!taskerId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Tasker ID and action are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let updateData: any = {};

    if (action === "suspend") {
      updateData = {
        tasker_application_status: "Suspended",
        is_approved: false,
        is_accepting_requests: false,
        suspension_reason: reason,
        suspended_at: new Date(),
        updatedAt: new Date(),
      };
    } else if (action === "reinstate") {
      updateData = {
        tasker_application_status: "Approved",
        is_approved: true,
        is_accepting_requests: true,
        suspension_reason: null,
        suspended_at: null,
        updatedAt: new Date(),
      };
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(taskerId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tasker not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tasker ${
        action === "suspend" ? "suspended" : "reinstated"
      } successfully`,
    });
  } catch (error) {
    console.error("Update tasker status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tasker status",
      },
      { status: 500 }
    );
  }
}
