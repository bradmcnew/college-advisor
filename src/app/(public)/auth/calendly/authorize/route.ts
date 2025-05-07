import { env } from "~/env";
import { requireServerAuth } from "~/lib/auth-utils";

const CALENDLY_ID = env.CALENDLY_ID;
const REDIRECT_URI = env.NEXT_PUBLIC_BASE_URL + "/auth/calendly/callback";

export async function GET() {
  // Get the current user
  const session = await requireServerAuth();

  // Redirect to Calendly authorization page
  const authUrl = new URL("https://auth.calendly.com/oauth/authorize");
  authUrl.searchParams.append("client_id", CALENDLY_ID);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);

  // Store user ID in state to verify on callback
  authUrl.searchParams.append("state", session.user.id);

  return Response.redirect(authUrl.toString());
}
