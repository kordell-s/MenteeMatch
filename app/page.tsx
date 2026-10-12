import { prisma } from "@/lib/prisma";
import Landing, { type PublicMentor } from "@/components/landing/Landing";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

async function getPublicMentors(): Promise<PublicMentor[]> {
  try {
    const users = await prisma.user.findMany({
      // Same population as Browse: mentors with a mentor profile
      where: { role: "MENTOR", profileComplete: true, mentor: { isNot: null } },
      select: {
        id: true,
        name: true,
        title: true,
        company: true,
        skills: true,
        profilePicture: true,
        bio: true,
        mentor: { select: { category: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return users.map(({ mentor, ...u }) => ({ ...u, skills: u.skills as string[], category: mentor?.category ?? "OTHER" }));
  } catch (err) {
    console.error("Landing: could not load mentors", err);
    return [];
  }
}

export default async function Home() {
  const mentors = await getPublicMentors();
  return (
    <>
      <main>
        <Landing mentors={mentors} />
      </main>
      <Footer />
    </>
  );
}
