import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

/** The signed-in user's own profile basics. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      bio: user.bio,
      company: user.company,
      title: user.title,
      location: user.location,
      skills: user.skills,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ error: "Could not load your profile." }, { status: 500 });
  }
}
