import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NavBarBase } from "~/app/_components/navigation-client";
import { getProfilePic } from "~/server/queries";
import { auth } from "~/server/auth";
import { ThemeProvider } from "~/components/theme-provider";

// uploadthing
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";

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
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-sky-100 to-gray-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthenticated && <NavBarBase profilePic={profilePic} />}
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
          {modal}
          <div id="modal-root" />
        </ThemeProvider>
      </body>
    </html>
  );
}
