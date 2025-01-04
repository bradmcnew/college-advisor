import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { UserProfile } from "~/app/types";
import { getProfileWithImage } from "~/server/queries";

export default async function ViewProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  try {
    const userProfile = await getProfileWithImage();

    if (!userProfile?.isMentor || !userProfile.isEduVerified) {
      redirect("/email-verification");
    }

    return (
      <>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20">
            <Image
              src={userProfile.user.image || "/images/placeholder.jpg"}
              alt="Profile picture"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-primary">
              Your Mentor Profile
            </h1>
            <p className="text-md text-muted-foreground">
              View and manage your profile information
            </p>
          </div>
          <div className="w-24" />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                Contact Information
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {userProfile.eduEmail}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  School Year
                </p>
                <p className="text-sm font-semibold">
                  {userProfile.schoolYear}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Graduation
                </p>
                <p className="text-sm font-semibold">
                  {userProfile.graduationYear}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
            </CardContent>
          </Card>
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
