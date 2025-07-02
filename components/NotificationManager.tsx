// Location: /components/NotificationManager.tsx

"use client";

import { useState, useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { toast } from "react-hot-toast";
import { Icon } from "@/components/DemoComponents";
import { useSplitInfo } from "@/hooks/useSplitInfo";

export function NotificationManager() {
  const { context } = useMiniKit();
  const [testing, setTesting] = useState(false);
  const { refreshSplitInfo, data: splitInfo } = useSplitInfo();
  
  const hasNotifications = context?.client?.notificationDetails;

  const testNotification = useCallback(async () => {
    if (!context?.user?.fid) {
      toast.error("No Farcaster ID found");
      return;
    }

    setTesting(true);
    const toastId = toast.loading("Testing notification...");

    try {
      // Refresh split info
      await refreshSplitInfo();
      
      // Send test notification
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          fid: context.user.fid,
          title: "Test Notifs & Tiers",
          body: `Thanks! Current Tier: ${splitInfo?.currentTier ?? 0}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to send notification");
      
      const result = await response.json();
      
      if (result.state === "success") {
        toast.success(`Test notification sent! Current Tier: ${splitInfo?.currentTier ?? 0}`, { id: toastId });
      } else if (result.state === "no_token") {
        toast.error("Please enable notifications first", { id: toastId });
      } else if (result.state === "rate_limit") {
        toast.error("Rate limited. Try again later", { id: toastId });
      } else {
        toast.error("Failed to send notification", { id: toastId });
      }
    } catch (err) {
      console.error("Notification error:", err);
      toast.error("Error sending notification", { id: toastId });
    } finally {
      setTesting(false);
    }
  }, [context, refreshSplitInfo, splitInfo]);

  if (!context) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {hasNotifications ? (
          <span className="text-green-600 dark:text-green-400">
            <Icon name="check" size="xs" /> Notifications enabled
          </span>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">
            Notifications disabled
          </span>
        )}
      </span>
      
      {hasNotifications && (
        <button
          type="button"
          className="btn-cyber text-sm px-2 py-1"
          onClick={testNotification}
          disabled={testing}
        >
          {testing ? "Testing..." : "Test Notify"}
        </button>
      )}
    </div>
  );
}
