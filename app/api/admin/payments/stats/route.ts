// app/api/admin/payments/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Total revenue - sum of all completed transactions regardless of type
    const totalRevenue = await db
      .collection("transactions")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ])
      .toArray();

    const stats = {
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Payment stats fetched successfully",
    });
  } catch (error) {
    console.error("Payment stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
