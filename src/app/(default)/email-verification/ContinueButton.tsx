"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { checkVerificationStatus } from "~/app/(default)/email-verification/actions";
import { useState } from "react";

export default function ContinueButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const isVerified = await checkVerificationStatus();

      if (isVerified) {
        router.push("/profile/view");
      } else {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and verify your address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="w-full"
      onClick={handleContinue}
      disabled={isLoading}
    >
      {isLoading ? "Checking..." : "Continue"}
    </Button>
  );
}
