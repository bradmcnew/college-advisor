import NextAuth from "next-auth";
import { unstable_cache } from "next/cache";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = unstable_cache(async (headers) => {
    return uncachedAuth(headers);
}, ["auth"], {
  revalidate: 0,
});

export { auth, handlers, signIn, signOut };
