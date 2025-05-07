import { auth } from "~/server/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session) { throw new Error("Authentication required"); }
  return session;
}

export async function requireServerAuth() {
  const session = await auth();
  if (!session?.userId) throw new Error("Unauthorized");
  return session;
}

