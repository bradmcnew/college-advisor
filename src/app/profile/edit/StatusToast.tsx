"use client";

import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast";

interface StatusToastProps {
  status: string;
}

export default function StatusToast({ status }: StatusToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!status) return;

    let title = "";
    let description = "";
    let variant: "default" | "destructive" = "default";

    switch (status) {
      case "invalid-input":
        title = "Invalid Input";
        description = "Please provide all the required information correctly.";
        variant = "destructive";
        break;
      case "error":
        title = "Error";
        description = "An unexpected error occurred. Please try again later.";
        variant = "destructive";
        break;
      case "profile-updated":
        title = "Success";
        description = "Your profile has been successfully updated!";
        break;
      case "not-found":
        title = "Not Found";
        description = "User profile not found.";
        variant = "destructive";
        break;
      case "invalid-image-type":
        title = "Invalid Image";
        description = "Invalid image type. Please upload a JPEG, PNG, or GIF.";
        variant = "destructive";
        break;
      case "image-too-large":
        title = "Image Too Large";
        description = "Image is too large. Maximum size is 5MB.";
        variant = "destructive";
        break;
      case "invalid-school-year":
        title = "Invalid School Year";
        description = "Selected school year is invalid.";
        variant = "destructive";
        break;
      case "invalid-graduation-year":
        title = "Invalid Graduation Year";
        description =
          "Graduation year must be the current year or a future year.";
        variant = "destructive";
        break;
    }

    if (title && description) {
      toast({
        title,
        description,
        variant,
      });
    }
  }, [status, toast]);

  return null;
}
