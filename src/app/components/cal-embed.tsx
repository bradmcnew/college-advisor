"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getCalApi } from "@calcom/embed-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

interface CalEmbedButtonProps {
  /** Cal.com username (e.g. "brad-mcnew-mhay1g") */
  username: string;
  /** Cal.com namespace (default: "30min") */
  namespace?: string;
  /** Button label */
  children?: ReactNode;
}

/**
 * Renders a button that opens the Cal.com embed UI for a given user.
 */
export function CalEmbedButton({
  username,
  namespace = "30min",
  children = "View schedule",
}: CalEmbedButtonProps) {
  const [calApi, setCalApi] = useState<
    ((method: string, options?: object) => void) | null
  >(null);
  const router = useRouter();
  const config = {
    layout: "month_view",
    hideEventTypeDetails: false,
  };

  // Load the Cal.com embed API once on mount (or when namespace changes)
  useEffect(() => {
    let isMounted = true;
    getCalApi({
      namespace,
      embedJsUrl: "https://mentor.discuno.com/embed/embed.js",
    })
      .then((api) => {
        if (isMounted) setCalApi(() => api);
      })
      .catch((error) => {
        console.error("Failed to load Cal.com embed API", error);
      });
    return () => {
      isMounted = false;
    };
  }, [namespace]);

  // When clicked, open the Cal.com UI widget
  const handleClick = () => {
    router.back();
    if (!calApi) {
      console.warn("Cal API is not initialized yet.");
      return;
    }
    try {
      calApi("ui", config);
    } catch (error) {
      console.error("Error opening Cal.com widget", error);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      data-cal-namespace={namespace}
      data-cal-link={`${username}/${namespace}`}
      data-cal-config={JSON.stringify(config)}
    >
      {children}
    </Button>
  );
}
