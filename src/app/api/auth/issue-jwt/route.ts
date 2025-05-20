import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { requireServerAuth } from "~/lib/auth-utils";
import { getProfile } from "~/server/queries";
import { env } from "~/env";

export async function POST() {
  try {
    const { userId } = await requireServerAuth();

    const profile = await getProfile(userId);
    const isEduVerified = profile?.isEduVerified;

    if (!isEduVerified) {
      return NextResponse.json(
        { message: "College email not verified" },
        { status: 403 },
      );
    }

    const token = jwt.sign(
      { sub: userId, email: profile?.eduEmail },
      env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
