// Location: /app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient, Errors } from "@farcaster/quick-auth";

const client = createClient();

const HOSTNAME =
  process.env.NEXT_PUBLIC_HOSTNAME ||
  process.env.NEXT_PUBLIC_HOST ||
  "myu.schmidtiest.xyz"; // fallback, set your prod domain here!

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Validate the Quick Auth JWT
    const payload = await client.verifyJwt({
      token,
      domain: HOSTNAME,
    });

    // Optionally: get primary address (for frontend display)
    let primaryAddress: string | undefined;
    try {
      const res = await fetch(
        `https://api.farcaster.xyz/fc/primary-address?fid=${payload.sub}&protocol=ethereum`
      );
      if (res.ok) {
        const json = await res.json();
        primaryAddress = json?.result?.address?.address;
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      fid: payload.sub,
      primaryAddress,
    });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("QuickAuth validation error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
