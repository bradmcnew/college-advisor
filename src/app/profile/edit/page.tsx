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
import StatusToast from "~/app/profile/edit/StatusToast";

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
      redirect("/profile/edit?status=invalid-input");
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
      redirect("/profile/edit?status=invalid-school-year");
    }

    // Validate graduationYear (e.g., should be current year or future)
    const currentYear = new Date().getFullYear();
    if (graduationYear < currentYear || graduationYear > currentYear + 10) {
      redirect("/profile/edit?status=invalid-graduation-year");
    }

    // Check if any change has been made
    const isProfileUnchanged =
      bio === userProfile.bio &&
      schoolYear === userProfile.schoolYear &&
      graduationYear === userProfile.graduationYear &&
      !profileImageUrl;

    if (isProfileUnchanged) {
      redirect("/profile/edit?status=profile-updated");
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
      redirect("/profile/edit?status=profile-updated");
    } catch (error: any) {
      // If the error is a NEXT_REDIRECT, rethrow it to allow Next.js to handle the redirect
      if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Error during profile update:", error);
      // Redirect to the edit profile page with an error status
      redirect("/profile/edit?status=error");
    }
  };

  // Extract the status from the query parameters for displaying messages
  const status = (await searchParams)?.status || "";

  return (
    <>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-primary">Edit Your Profile</h2>
        <p className="text-muted-foreground">Update your profile information</p>
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
          />
        </div>

        <div>
          <Label htmlFor="school_year">School Year</Label>
          <Select
            name="school_year"
            required
            defaultValue={userProfile.schoolYear}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your current school year" />
            </SelectTrigger>
            <SelectContent>
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
          />
        </div>

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>

      <StatusToast status={status} />
    </>
  );
}
