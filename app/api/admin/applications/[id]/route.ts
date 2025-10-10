import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const application = await db
      .collection("taskerapplications")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            user: {
              _id: "$userInfo._id",
              name: "$userInfo.name",
              phone: "$userInfo.phone_number",
              email: "$userInfo.email",
              avatar_url: "$userInfo.avatar_url",
            },
            about: 1,
            skills: 1,
            idImages: 1,
            workImages: 1,
            status: 1,
            appliedAt: 1,
            reviewedAt: 1,
            reviewedBy: 1,
            rejectionReason: 1,
            category: 1,
            experience: 1,
            location: 1,
            hourlyRate: 1,
          },
        },
      ])
      .next();

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: "Application details fetched successfully",
    });
  } catch (error) {
    console.error("Application details error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application details" },
      { status: 500 }
    );
  }
}
