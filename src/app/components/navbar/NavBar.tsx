import { NavBarBase } from "~/app/components/navbar/NavigationClient";
import { getProfilePic } from "~/server/queries";
import { cache } from "react";
import { requireAuth } from "~/lib/auth-utils";

// Cache the profile pic fetch to avoid repeated DB calls
const getProfilePicCached = cache(async (userId: string) => {
  try {
    return (await getProfilePic(userId)) ?? "";
  } catch (error) {
    console.error("Error fetching profile pic:", error);
    return "";
  }
});

export async function NavBar() {
  const { userId } = await requireAuth();
  const profilePic = await getProfilePicCached(userId);

  return <NavBarBase profilePic={profilePic} />;
}
