// Location: /app/api/notify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { redis, storeNotification } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, data } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Missing userId or type" },
        { status: 400 }
      );
    }

    // ✅ Store notification in Redis if available
    if (redis) {
      await storeNotification(userId, {
        type,
        data,
        timestamp: Date.now(),
      });
    } else {
      console.warn("Redis not configured - notification not stored");
    }

    // ✅ Send push notification via MiniKit if configured
    if (process.env.MINIKIT_API_KEY) {
      // Implement MiniKit notification logic here
      console.log("Sending notification:", { userId, type, data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 503 }
    );
  }

  const notification = await redis.get(`notification:${userId}`);
  return NextResponse.json(notification || {});
}
