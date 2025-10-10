import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { paymentId, status } = await request.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, message: "Payment ID and status are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("payments").updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status: status,
          paymentDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Payment not found or status unchanged" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Payment process error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process payment" },
      { status: 500 }
    );
  }
}
