import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { applicationId, reason } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const query = { _id: applicationId };


    const result = await db.collection("taskerapplications").updateOne(
      query,
      {
        $set: {
          status: "rejected",
          reviewedAt: new Date(),
          rejectionReason: reason || "Application rejected by administrator",
          // You can add reviewedBy with admin user ID
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error("Application rejection error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject application" },
      { status: 500 }
    );
  }
}
