import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        //fetch upcoming sessions
        const upcomingSessions = await prisma.session.findMany({
            where: {
                mentorId: userId,
                status: "UPCOMING",
            },
            orderBy: {
                date: "asc"},
    });

    //fetch completed sessions
    const completedSessions = await prisma.session.findMany({
        where: {
            mentorId: userId,
            status: "COMPLETED",
        },
    });

    //fetch pending mentorship requests (from bookings)
    const mentorshipRequests = await prisma.booking.findMany({
        where: {
            mentorId: userId,
            status: "PENDING",
        },
        include:{
            mentee:true,
        },
    });

    //total mentees (unique mentees based on bookings)
    const menteeBookings = await prisma.booking.findMany({
        where: {
            mentorId: userId,
        },
        select:{
            menteeId:true,
        },
        distinct:["menteeId"],
    });

    const totalMentees = menteeBookings.length;
    return NextResponse.json({
        upcomingSessions,
        completedSessionsCount: completedSessions.length,
        mentorshipRequests,
        totalMentees,
    });
} catch (error) {
        console.error("Error fetching mentor data:", error);
        return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 });
    }
}