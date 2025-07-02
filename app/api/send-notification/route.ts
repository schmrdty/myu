// Location: /app/api/send-notification/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendMiniAppNotification } from "@/lib/notification-client";

export async function POST(request: NextRequest) {
  try {
    const { fid, title, body } = await request.json();

    if (!fid || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendMiniAppNotification({
      fid,
      title,
      body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
