"use client";

import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { UploadButton } from "~/utils/uploadthing";
import { Input } from "~/components/ui/input";
import Image from "next/image";

interface ImageUploaderProps {
  currentImage: string | null;
}

export default function ImageUploader({ currentImage }: ImageUploaderProps) {
  const { toast } = useToast();
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

      toast({
        title: "Success",
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
          className="mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-primary/20"
          width={96}
          height={96}
        />
      ) : (
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-primary/20">
          No Image
        </div>
      )}
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }}
      />
      <Input
        id="profile_image_url"
        name="profile_image_url"
        type="hidden"
        value={imageUrl}
        readOnly
      />
    </div>
  );
}
