import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import Image from "next/image";

interface UserProfile {
  userId: string;
  bio: string;
  schoolYear: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  graduationYear: number;
  eduEmail: string;
  isMentor: boolean;
  isEduVerified: boolean;
  user: {
    image: string | null;
  };
}

export default async function ViewProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  try {
    const userProfile = (await db.query.userProfiles.findFirst({
      where: (table, { eq }) => eq(table.userId, session.userId),
      columns: {
        userId: true,
        bio: true,
        schoolYear: true,
        graduationYear: true,
        eduEmail: true,
        isMentor: true,
        isEduVerified: true,
      },
      with: {
        user: {
          columns: {
            image: true,
          },
        },
      },
    })) as (UserProfile & { user: { image: string | null } }) | null;

    if (!userProfile?.isMentor || !userProfile.isEduVerified) {
      redirect("/email-verification");
    }

    return (
      <>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">
            Your Mentor Profile
          </h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full ring-2 ring-primary/20">
          <Image
            src={userProfile.user.image || "/images/placeholder.jpg"}
            alt="Profile picture"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-4 divide-y divide-border">
          <div className="space-y-2 pt-4">
            <h2 className="text-lg font-semibold text-foreground">
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground">
              Email: {userProfile.eduEmail}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-lg font-semibold text-foreground">
              Academic Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="block font-medium">School Year</span>
                {userProfile.schoolYear}
              </div>
              <div>
                <span className="block font-medium">Graduation Year</span>
                {userProfile.graduationYear}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-lg font-semibold text-foreground">Biography</h2>
            <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </>
    );
  } catch (error: any) {
    if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error fetching profile:", error);
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        An error occurred while loading your profile. Please try again later.
      </div>
    );
  }
}
