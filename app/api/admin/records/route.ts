import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const records = await db
      .collection("mpesaPaymentRecord")
      .find({})
      .sort({ transactionDate: -1 }) // Sort by latest transactions first
      .toArray();

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("MPESA records fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch MPESA records",
      },
      { status: 500 }
    );
  }
}
