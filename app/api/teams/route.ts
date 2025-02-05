import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createNotification, getTeamUrl } from "@/lib/notifications"
import { NotificationType } from "@prisma/client"

// Pobieranie zespołów
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania zespołów" },
      { status: 500 }
    )
  }
}

// Tworzenie zespołu
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, members } = await req.json()

    if (!name || !members || !Array.isArray(members)) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane zespołu" },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: [
            // Dodaj twórcę zespołu jako administratora
            {
              userId: session.user.id,
              role: "admin",
            },
            // Dodaj pozostałych członków jako zwykłych użytkowników
            ...members.filter((member: any) => member.userId !== session.user.id).map((member: any) => ({
              userId: member.userId,
              role: "member",
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "create_team",
        description: `Utworzono zespół: ${name}`,
        userId: session.user.id,
      },
    })

    // Wyślij powiadomienia do wszystkich członków zespołu (oprócz twórcy)
    const creatorName = session.user.name || "Administrator"
    const notificationPromises = members
      .filter((member: any) => member.userId !== session.user.id)
      .map((member: any) =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: NotificationType.TEAM_INVITE,
            title: "Dodano do zespołu",
            message: `Zostałeś dodany do zespołu ${name} przez ${creatorName}.`,
            targetId: String(team.id),
            actionUrl: getTeamUrl(String(team.id)),
          }
        })
      )

    await Promise.all(notificationPromises)

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia zespołu" },
      { status: 500 }
    )
  }
} 