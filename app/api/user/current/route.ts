import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // TODO: Replace this with actual session/authentication logic
    // For now, using a hardcoded user ID - you'll need to implement proper session handling
    const currentUserId = "3459d90e-8bd8-43f2-9b17-b40b16625668"; // Alex James (mentee)
    
    // In a real app, you would get the user ID from the session like:
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const currentUserId = session.user.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the current user's data
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        role: true,
        bio: true,
        company: true,
        title: true,
        location: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    });

  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
