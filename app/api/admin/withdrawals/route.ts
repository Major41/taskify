import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const withdrawalRequests = await db
      .collection("withdrawPaymentRequests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            phoneNumber: 1,
            withdrawAmount: 1,
            isPaymentApproved: 1,
            dateOfPaymentRequest: 1,
            dateOfPaymentApproval: 1,
            mpesaCode: 1,
            user: {
              first_name: 1,
              last_name: 1,
              email: 1,
              profile_url: 1,
            },
          },
        },
        {
          $sort: { dateOfPaymentRequest: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: withdrawalRequests,
    });
  } catch (error) {
    console.error("Withdrawals fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch withdrawal requests",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { withdrawalId, action } = await request.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal ID and action are required",
        },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Must be 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Validate if the ID is a valid ObjectId
    if (!ObjectId.isValid(withdrawalId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal ID",
        },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Generate a mock MPESA code (in real implementation, you'd call MPESA API)
      const mpesaCode = `MPE${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const result = await db.collection("withdrawPaymentRequests").updateOne(
        {
          _id: new ObjectId(withdrawalId),
        },
        {
          $set: {
            isPaymentApproved: true,
            dateOfPaymentApproval: Date.now(),
            mpesaCode: mpesaCode,
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Withdrawal request not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          dateOfPaymentApproval: Date.now(),
          mpesaCode: mpesaCode,
        },
        message: "Withdrawal approved successfully",
      });
    } else if (action === "reject") {
      // For rejection, we'll delete the request
      const result = await db.collection("withdrawPaymentRequests").deleteOne({
        _id: new ObjectId(withdrawalId),
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Withdrawal request not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected successfully",
      });
    }
  } catch (error) {
    console.error("Withdrawal update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process withdrawal request",
      },
      { status: 500 }
    );
  }
}
