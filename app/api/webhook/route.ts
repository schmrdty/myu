// Location: /app/api/webhook/route.ts

import {
  setUserNotificationDetails,
  deleteUserNotificationDetails,
} from "@/lib/notification";
import { sendFrameNotification } from "@/lib/notification-client";
import { redis, storeMintTransaction, incrementUserMints } from "@/lib/redis";
import { http } from "viem";
import { createPublicClient } from "viem";
import { optimism } from "viem/chains";
import crypto from "crypto";

const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Myutruvian";

const KEY_REGISTRY_ADDRESS = "0x00000000Fc1237824fb747aBDE0FF18990E59b7e";

const KEY_REGISTRY_ABI = [
  {
    inputs: [
      { name: "fid", type: "uint256" },
      { name: "key", type: "bytes" },
    ],
    name: "keyDataOf",
    outputs: [
      {
        components: [
          { name: "state", type: "uint8" },
          { name: "keyType", type: "uint32" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function verifyFidOwnership(fid: number, appKey: `0x${string}`) {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  try {
    const result = await client.readContract({
      address: KEY_REGISTRY_ADDRESS,
      abi: KEY_REGISTRY_ABI,
      functionName: "keyDataOf",
      args: [BigInt(fid), appKey],
    });

    return result.state === 1 && result.keyType === 1;
  } catch (error) {
    console.error("Key Registry verification failed:", error);
    return false;
  }
}

function decode(encoded: string) {
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
}

// ✅ Verify webhook signature for custom webhooks
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!process.env.WEBHOOK_SECRET) return false;

  const hash = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

export async function POST(request: Request) {
  const requestText = await request.text();
  const requestJson = JSON.parse(requestText);

  // ✅ Check if this is a MiniKit webhook (has header/payload) or custom webhook
  if (requestJson.header && requestJson.payload) {
    // Handle MiniKit webhooks
    const { header: encodedHeader, payload: encodedPayload } = requestJson;

    const headerData = decode(encodedHeader);
    const event = decode(encodedPayload);

    const { fid, key } = headerData;

    const valid = await verifyFidOwnership(fid, key);

    if (!valid) {
      return Response.json(
        { success: false, error: "Invalid FID ownership" },
        { status: 401 },
      );
    }

    switch (event.event) {
      case "frame_added":
        console.log(
          "frame_added",
          "event.notificationDetails",
          event.notificationDetails,
        );
        if (event.notificationDetails) {
          await setUserNotificationDetails(fid, event.notificationDetails);

          // ✅ Store in Redis if available
          if (redis) {
            await redis.set(
              `user:${fid}:frame_added`,
              JSON.stringify({
                timestamp: Date.now(),
                notificationDetails: event.notificationDetails,
              }),
              { ex: 2592000 } // 30 days
            );
          }

          await sendFrameNotification({
            fid,
            title: `Welcome to ${appName}`,
            body: `Thank you for adding ${appName}`,
          });
        } else {
          await deleteUserNotificationDetails(fid);
        }
        break;

      case "frame_removed": {
        console.log("frame_removed");
        await deleteUserNotificationDetails(fid);

        // ✅ Remove from Redis if available
        if (redis) {
          await redis.del(`user:${fid}:frame_added`);
        }
        break;
      }

      case "notifications_enabled": {
        console.log("notifications_enabled", event.notificationDetails);
        await setUserNotificationDetails(fid, event.notificationDetails);

        // ✅ Store notification preferences in Redis
        if (redis) {
          await redis.set(
            `user:${fid}:notifications_enabled`,
            "true",
            { ex: 2592000 } // 30 days
          );
        }

        await sendFrameNotification({
          fid,
          title: `Welcome to ${appName}`,
          body: `Thank you for enabling notifications for ${appName}`,
        });
        break;
      }

      case "notifications_disabled": {
        console.log("notifications_disabled");
        await deleteUserNotificationDetails(fid);

        // ✅ Update Redis if available
        if (redis) {
          await redis.set(
            `user:${fid}:notifications_enabled`,
            "false",
            { ex: 2592000 } // 30 days
          );
        }
        break;
      }
    }

    return Response.json({ success: true });
  } else {
    // ✅ Handle custom webhooks (e.g., from your smart contract events)
    const signature = request.headers.get("x-webhook-signature");

    // Verify webhook if secret is configured
    if (process.env.WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(requestText, signature);
      if (!isValid) {
        return Response.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const { event, data } = requestJson;

    // Handle different webhook events
    switch (event) {
      case "mint.success": {
        // ✅ Fixed: Properly structured mint.success case
        let notificationDetails = null;

        if (redis) {
          await storeMintTransaction(data.txHash, {
            address: data.address,
            tokenId: data.tokenId,
            method: data.method,
            timestamp: Date.now(),
            fid: data.fid,
          });
          await incrementUserMints(data.address, data.fid);
          
          // Get notification details if FID exists
          if (data.fid) {
            notificationDetails = await redis.get(`user:${data.fid}:notificationDetails`);
          }
        }

        // ✅ Send notification if user has notifications enabled
        if (data.fid) {
          await sendFrameNotification({
            fid: data.fid,
            title: "Mint Successful! 🍄",
            body: `Your Myutruvian NFT #${data.tokenId} has been minted!`,
            ...(notificationDetails ? { notificationDetails: JSON.parse(notificationDetails as string) } : {}),
          });
        }
        break;
      }

      case "mint.failed":
        console.error("Mint failed:", data);

        // ✅ Notify user of failure
        if (data.fid) {
          await sendFrameNotification({
            fid: data.fid,
            title: "Mint Failed",
            body: "Your mint transaction failed. Please try again.",
          });
        }
        break;

      default:
        console.log("Unknown webhook event:", event);
    }

    return Response.json({ success: true });
  }
}
