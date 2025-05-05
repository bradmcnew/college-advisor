import { type NextRequest } from "next/server";
import { auth } from "~/server/auth";
import { fetchUserAvailability } from "~/utils/calendly";

export async function GET(request: NextRequest) {
  // Get the current user
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query params
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || session.user.id;

  // Check if user has permission to access this userId
  if (userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const availabilityData = await fetchUserAvailability(userId);

    if (!availabilityData) {
      return Response.json({ error: "Failed to fetch availability" }, { status: 400 });
    }

    return Response.json(availabilityData);
  } catch (error) {
    console.error("Availability API error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
