import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const teamId = parseInt(params.id)
    const data = await req.json()

    // Sprawdź, czy użytkownik jest administratorem zespołu
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Nie masz uprawnień do edycji tego zespołu" },
        { status: 403 }
      )
    }

    // Aktualizuj zespół
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: data.name,
        members: {
          deleteMany: {}, // Usuń wszystkich członków
          create: data.members.map((member: any) => ({
            userId: member.userId,
            role: member.role,
          })),
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
        type: "update_team",
        description: `Zaktualizowano zespół: ${data.name}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji zespołu" },
      { status: 500 }
    )
  }
} 