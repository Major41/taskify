import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all taskers that are not approved yet
    const taskers = await db
      .collection("taskers")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "_id",
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
            _id: 1,
            user: {
              _id: "$userInfo._id",
              name: "$userInfo.first_name",
              phone: "$userInfo.phone_number",
              email: "$userInfo.email",
              avatar_url: "$userInfo.profile_url",
            },
            about: "$tasker_about",
            skills: 1,
            idImages: {
              passport: "$passport_photo",
              id_front: "$id_card_front",
              id_back: "$id_card_back",
            },
            workImages: "$job_images",
            status: {
              $cond: {
                if: { $eq: ["$is_approved", true] },
                then: "approved",
                else: "pending",
              },
            },
            appliedAt: "$tasker_reg_date",
            category: { $arrayElemAt: ["$skills.category_name", 0] },
            experience: { $arrayElemAt: ["$skills.skill_experience", 0] },
            hourlyRate: { $arrayElemAt: ["$skills.work_rate_amount", 0] },
            location: 1,
            is_approved: 1,
            averageRating: "$tasker_average_rating",
            completedTasks: "$tasker_complete_tasks",
            is_accepting_requests: 1,
            respond_time: 1,
          },
        },
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: taskers,
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
