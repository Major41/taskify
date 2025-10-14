import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch taskers who need verification (approved but not fully verified)
    const taskers = await db
      .collection("taskers")
      .aggregate([
        {
          $match: {
            is_approved: true, // Only show approved taskers
          },
        },
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
          $match: {
            // Only fetch verifications where stage 3 is Pending
            "userInfo.verification_level3_status": "Pending",
          },
        },
        {
          $project: {
            _id: 1,
            tasker: {
              _id: "$userInfo._id",
              name: {
                $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
              },
              phone: "$userInfo.phone_number",
              email: "$userInfo.email",
              avatar_url: "$userInfo.profile_url",
            },
            // Verification stages from user collection
            verification_stages: {
              stage1: "$userInfo.verification_level1_status",
              stage2: "$userInfo.verification_level2_status",
              stage3: "$userInfo.verification_level3_status",
              stage4: "$userInfo.verification_level4_status",
              stage5: "$userInfo.verification_level5_status",
            },
            // Images from tasker collection for verification
            identification_images: {
              passport: "$passport_photo",
              id_front: "$id_card_front",
              id_back: "$id_card_back",
            },
            work_images: "$job_images",
            skills: 1,
            tasker_about: 1,
            tasker_average_rating: 1,
            tasker_complete_tasks: 1,
            tasker_reg_date: 1,
            is_accepting_requests: 1,
            overallStatus: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: ["$userInfo.verification_level5_status", "Verified"],
                    },
                    then: "approved",
                  },
                  {
                    case: {
                      $or: [
                        {
                          $eq: [
                            "$userInfo.verification_level3_status",
                            "Pending",
                          ],
                        },
                        {
                          $eq: [
                            "$userInfo.verification_level4_status",
                            "Unverified",
                          ],
                        },
                        {
                          $eq: [
                            "$userInfo.verification_level5_status",
                            "Unverified",
                          ],
                        },
                      ],
                    },
                    then: "pending",
                  },
                ],
                default: "pending",
              },
            },
            appliedAt: "$tasker_reg_date",
            updatedAt: 1,
          },
        },
        {
          $sort: { appliedAt: -1 },
        },
      ])
      .toArray();

    // Filter work_images in JavaScript to only include valid URLs
    const filteredTaskers = taskers.map((tasker) => ({
      ...tasker,
      work_images: tasker.work_images
        ? tasker.work_images.filter(
            (image) =>
              image &&
              (image.startsWith("https://") || image.startsWith("http://"))
          )
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: filteredTaskers,
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

// API to approve verification stages (same as above)
export async function POST(request: Request) {
  try {
    const { taskerId, stage } = await request.json();

    if (!taskerId || !stage) {
      return NextResponse.json(
        { success: false, message: "Tasker ID and stage are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Map stage to verification level
    const stageMapping = {
      stage3: "verification_level3_status",
      stage4: "verification_level4_status",
      stage5: "verification_level5_status",
    };

    const verificationField = stageMapping[stage];

    if (!verificationField) {
      return NextResponse.json(
        { success: false, message: "Invalid stage" },
        { status: 400 }
      );
    }

    // Update the verification status in users collection
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(taskerId) },
      {
        $set: {
          [verificationField]: "Verified",
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Tasker not found or already verified" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Stage ${stage} approved successfully`,
    });
  } catch (error) {
    console.error("Approve stage error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
