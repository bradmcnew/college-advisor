import { NavBarBase } from "~/app/components/navbar/NavigationClient";
import { getProfilePic } from "~/server/queries";
import { cache } from "react";
import { requireAuth } from "~/lib/auth-utils";

// Cache the profile pic fetch to avoid repeated DB calls
const getProfilePicCached = cache(async () => {
  try {
    return (await getProfilePic()) ?? "";
  } catch (error) {
    console.error("Error fetching profile pic:", error);
    return "";
  }
});

export async function NavBar() {
  await requireAuth();
  const profilePic = await getProfilePicCached();

  return <NavBarBase profilePic={profilePic} />;
}
