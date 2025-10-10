import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update application status
    const applicationResult = await db
      .collection("taskerapplications")
      .updateOne(
        { _id: new ObjectId(applicationId) },
        {
          $set: {
            status: "approved",
            reviewedAt: new Date(),
            // You can add reviewedBy with admin user ID
          },
        }
      );

    if (applicationResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Get application to update user role
    const application = await db.collection("taskerapplications").findOne({
      _id: new ObjectId(applicationId),
    });

    if (application) {
      // Update user role to tasker
      await db
        .collection("users")
        .updateOne({ _id: application.userId }, { $set: { role: "tasker" } });
    }

    return NextResponse.json({
      success: true,
      message: "Application approved successfully",
    });
  } catch (error) {
    console.error("Application approval error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve application" },
      { status: 500 }
    );
  }
}
