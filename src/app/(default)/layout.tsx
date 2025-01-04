import "~/styles/globals.css";

import { NavBarBase } from "~/app/components/navbar/NavigationClient";
import { getProfilePic } from "~/server/queries";
import { auth } from "~/server/auth";

export default async function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  let profilePic = "";
  let isAuthenticated = false;

  try {
    const session = await auth();

    if (session) {
      isAuthenticated = true;
      profilePic = (await getProfilePic()) ?? "";
    }
  } catch (error) {
    console.error("Error fetching profile pic:", error);
  }

  return (
    <>
      {isAuthenticated && <NavBarBase profilePic={profilePic} />}
      {children}
      {modal}
      <div id="modal-root" />
    </>
  );
}
