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

    // Use the query variable consistently
    const query = { _id: applicationId };


    // Update the tasker's is_approved status to true using the query
    const result = await db.collection("taskers").updateOne(
      query, // Use the query variable here
      {
        $set: {
          is_approved: true,
          reviewedAt: new Date().toISOString(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found or already approved",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: false,
      message: "Application approved successfully",
    });
  } catch (error) {
    console.error("Approve application error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
