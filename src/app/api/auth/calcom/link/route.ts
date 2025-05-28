import { type NextRequest, NextResponse } from "next/server";
import { requireServerAuth } from "~/lib/auth-utils";
import { updateUserProfile } from "~/server/queries";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireServerAuth(); //  UUID
    const { calcomUserId } = await req.json(); // numeric Cal.com ID
    if (typeof calcomUserId !== "number") {
      return NextResponse.json({ message: "bad payload" }, { status: 400 });
    }
    await updateUserProfile(userId, { calcomUserId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
}
