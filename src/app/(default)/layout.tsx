import "~/styles/globals.css";

import { NavBar } from "~/app/components/navbar/NavBar";
import { Suspense } from "react";

export default async function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <NavBar />
      </Suspense>
      {children}
      {modal}
      <div id="modal-root" />
    </>
  );
}
