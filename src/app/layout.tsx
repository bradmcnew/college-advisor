import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NavBarBase } from "~/app/_components/navigation-client";
import { getProfilePic } from "~/server/queries";
import { auth } from "~/server/auth";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "College Advice - Your Guide to College Success",
  description:
    "Discover personalized advice, resources, and tools to help you get into your dream college.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <body className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white dark:from-blue-950 dark:via-blue-900 dark:to-blue-800">
          {isAuthenticated && <NavBarBase profilePic={profilePic} />}
          {children}
          {modal}
          <div id="modal-root" />
        </body>
      </ThemeProvider>
    </html>
  );
}
