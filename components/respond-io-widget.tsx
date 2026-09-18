"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  RESPOND_IO_SCRIPT_ID,
  respondIoWidgetSrc,
  wireRespondAnalytics,
  type RespondApi,
} from "@/lib/respond-io";

/**
 * Native Respond.io Website Chat launcher. The cId is a public widget
 * identifier (visible in page source by design), not a secret.
 *
 * Loading architecture:
 * - Client-only: this effect never runs during server rendering, and the
 *   injected script is async — nothing blocks page rendering.
 * - Deferred until the window `load` event so the widget's ~670KB of
 *   iframe assets never compete with the page's own critical resources.
 * - Idempotent: the script element carries a fixed id and is appended to
 *   document.body, so it survives App Router client-side navigation and
 *   component remounts without re-initializing the widget.
 * - Graceful: if the CDN is blocked, the channel rejects the domain, or
 *   `window.$respond` never appears, the site is simply left without a
 *   launcher — no fallback UI is needed because chat is additive.
 */
export function RespondIoWidget() {
  useEffect(() => {
    const cId = process.env.NEXT_PUBLIC_RESPOND_IO_CID;
    if (!cId || document.getElementById(RESPOND_IO_SCRIPT_ID)) return;

    let cancelled = false;

    const inject = () => {
      if (cancelled || document.getElementById(RESPOND_IO_SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = RESPOND_IO_SCRIPT_ID;
      script.src = respondIoWidgetSrc(cId);
      script.async = true;
      script.onload = () => {
        const respond = (window as { $respond?: RespondApi }).$respond;
        if (!respond) return;
        wireRespondAnalytics(respond, {
          onChatOpen: () => trackEvent("chat_open"),
          onConversationStart: () => trackEvent("chat_conversation_started"),
        });
      };
      document.body.appendChild(script);
    };

    // On the first visit the effect runs while the page is still loading —
    // wait for `load` so the widget stays off the critical path. On
    // client-side navigation the page is already complete, so inject now.
    if (document.readyState === "complete") {
      inject();
    } else {
      window.addEventListener("load", inject, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", inject);
    };
  }, []);

  return null;
}
