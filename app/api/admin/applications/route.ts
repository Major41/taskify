import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all tasker applications with user information
    const applications = await db
      .collection("taskerapplications")
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
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: applications,
      message: "Applications fetched successfully",
    });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch applications",
        data: [],
      },
      { status: 500 }
    );
  }
}
