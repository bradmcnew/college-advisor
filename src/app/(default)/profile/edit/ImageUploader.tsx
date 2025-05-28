"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import Image from "next/image";
interface ImageUploaderProps {
  currentImage: string | null;
}

export default function ImageUploader({ currentImage }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(currentImage ?? "");

  const handleUploadComplete = (res: { url: string }[]) => {
    if (res?.[0]?.url) {
      const url = res[0].url;
      setImageUrl(url);

      // Update the hidden input value
      const hiddenInput = document.getElementById(
        "profile_image_url",
      ) as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = url;
      }

      toast.success("Success", {
        description: "Profile image updated successfully",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Profile Image"
          className="ring-primary/20 mb-4 h-24 w-24 rounded-full object-cover ring-2"
          width={96}
          height={96}
        />
      ) : (
        <div className="bg-muted text-muted-foreground ring-primary/20 mb-4 flex h-24 w-24 items-center justify-center rounded-full ring-2">
          No Image
        </div>
      )}
      {/* replace when vercel blob implement
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) => {
          toast.error("Error", {
            description: error.message,
          });
        }}
      />
      */}
      <Input name="profile_image_url" type="hidden" value={imageUrl} readOnly />
    </div>
  );
}
