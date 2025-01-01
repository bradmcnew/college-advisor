import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { userProfiles, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import ImageUploader from "~/app/components/image-uploader";

// EditProfileProps Interface
interface EditProfileProps {
  searchParams?: { status?: string };
}

// UserProfile Interface
interface UserProfile {
  userId: string;
  bio: string;
  schoolYear: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  graduationYear: number;
  eduEmail: string;
  isEduVerified: boolean;
  isMentor: boolean;
  user?: {
    image: string | null;
  };
}

export default async function EditProfilePage({
  searchParams,
}: EditProfileProps) {
  const session = await auth();

  // Redirect unauthenticated users to the homepage
  if (!session) {
    redirect("/");
  }

  // Fetch the user's profile from the database
  const userProfile = (await db.query.userProfiles.findFirst({
    where: (table, { eq }) => eq(table.userId, session.userId),
    with: {
      user: {
        columns: {
          image: true,
        },
      },
    },
  })) as UserProfile | null;

  // If the user is not a mentor or their .edu email is not verified, redirect them
  if (!userProfile?.isMentor || !userProfile.isEduVerified) {
    redirect("/email-verification");
  }

  // Function to handle profile updates
  const handleUpdateProfile = async (formData: FormData) => {
    "use server";
    const bio = formData.get("bio") as string;
    const schoolYear = formData.get("school_year") as string;
    const graduationYear = parseInt(
      formData.get("graduation_year") as string,
      10,
    );
    const profileImageUrl = formData.get("profile_image_url") as string | null;

    // Basic validation
    if (!bio || !schoolYear || isNaN(graduationYear)) {
      redirect("/edit-profile?status=invalid-input");
    }

    // Validate schoolYear
    const validSchoolYears = [
      "Freshman",
      "Sophomore",
      "Junior",
      "Senior",
      "Graduate",
    ];
    if (!validSchoolYears.includes(schoolYear)) {
      redirect("/edit-profile?status=invalid-school-year");
    }

    // Validate graduationYear (e.g., should be current year or future)
    const currentYear = new Date().getFullYear();
    if (graduationYear < currentYear || graduationYear > currentYear + 10) {
      redirect("/edit-profile?status=invalid-graduation-year");
    }

    // Check if any change has been made
    const isProfileUnchanged =
      bio === userProfile.bio &&
      schoolYear === userProfile.schoolYear &&
      graduationYear === userProfile.graduationYear &&
      !profileImageUrl;

    if (isProfileUnchanged) {
      redirect("/edit-profile?status=profile-updated");
    }

    try {
      // Update the userProfiles table with the additional information
      await db
        .update(userProfiles)
        .set({
          bio,
          schoolYear: schoolYear as
            | "Freshman"
            | "Sophomore"
            | "Junior"
            | "Senior"
            | "Graduate",
          graduationYear,
        })
        .where(eq(userProfiles.userId, session.userId));

      // Update the user's image in the 'users' table if a new image URL is provided
      if (profileImageUrl) {
        await db
          .update(users)
          .set({
            image: profileImageUrl,
          })
          .where(eq(users.id, session.userId));
      }

      // Redirect to the edit profile page upon successful update
      redirect("/edit-profile?status=profile-updated");
    } catch (error: any) {
      // If the error is a NEXT_REDIRECT, rethrow it to allow Next.js to handle the redirect
      if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Error during profile update:", error);
      // Redirect to the edit profile page with an error status
      redirect("/edit-profile?status=error");
    }
  };

  // Extract the status from the query parameters for displaying messages
  const status = (await searchParams)?.status || "";
  let displayMessage = "";
  let isDisplaySuccess = false;

  switch (status) {
    case "invalid-input":
      displayMessage = "Please provide all the required information correctly.";
      break;
    case "error":
      displayMessage = "An unexpected error occurred. Please try again later.";
      break;
    case "profile-updated":
      displayMessage = "Your profile has been successfully updated!";
      isDisplaySuccess = true;
      break;
    case "not-found":
      displayMessage = "User profile not found.";
      break;
    case "invalid-image-type":
      displayMessage = "Invalid image type. Please upload a JPEG, PNG, or GIF.";
      break;
    case "image-too-large":
      displayMessage = "Image is too large. Maximum size is 5MB.";
      break;
    case "invalid-school-year":
      displayMessage = "Selected school year is invalid.";
      break;
    case "invalid-graduation-year":
      displayMessage =
        "Graduation year must be the current year or a future year.";
      break;
    default:
      displayMessage = "";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200 via-indigo-200 to-emerald-200 px-4 dark:from-gray-950 dark:via-slate-900 dark:to-blue-950">
      <div className="relative mx-auto max-w-md space-y-6 rounded-lg bg-card p-8 text-card-foreground shadow-lg transition-all duration-300 dark:shadow-primary/5 sm:p-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
            Edit Your Profile
          </h2>
          {displayMessage && (
            <p
              className={`text-sm ${
                isDisplaySuccess ? "text-green-500" : "text-destructive"
              }`}
            >
              {displayMessage}
            </p>
          )}
        </div>

        <form action={handleUpdateProfile} className="space-y-4">
          <ImageUploader currentImage={userProfile.user?.image ?? null} />
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              name="bio"
              type="text"
              placeholder="Tell us about yourself..."
              required
              defaultValue={userProfile.bio || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="school_year">School Year</Label>
            <Select
              name="school_year"
              required
              defaultValue={userProfile.schoolYear}
            >
              <SelectTrigger className="w-full dark:bg-gray-700">
                <SelectValue placeholder="Select your current school year" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700">
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="graduation_year">Graduation Year</Label>
            <Input
              id="graduation_year"
              name="graduation_year"
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              placeholder="e.g., 2027"
              required
              defaultValue={userProfile.graduationYear || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600"
            />
          </div>

          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
