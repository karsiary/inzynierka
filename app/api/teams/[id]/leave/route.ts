import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const teamId = parseInt(params.id)

    // Pobierz wszystkich członków zespołu
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Zespół nie istnieje" },
        { status: 404 }
      )
    }

    // Sprawdź, czy użytkownik jest członkiem zespołu
    const teamMember = team.members.find(member => member.userId === session.user.id)

    if (!teamMember) {
      return NextResponse.json(
        { error: "Nie jesteś członkiem tego zespołu" },
        { status: 403 }
      )
    }

    // Jeśli zespół ma tylko jednego członka, usuń cały zespół
    if (team.members.length === 1) {
      await prisma.team.delete({
        where: { id: teamId }
      })

      await prisma.activity.create({
        data: {
          type: "delete_team",
          description: `Usunięto zespół: ${team.name} (ostatni członek opuścił zespół)`,
          userId: session.user.id,
        },
      })

      return NextResponse.json({ success: true, teamDeleted: true })
    }

    // Sprawdź, czy użytkownik jest administratorem
    if (teamMember.role === "admin") {
      // Policz administratorów
      const adminCount = team.members.filter(member => member.role === "admin").length

      if (adminCount === 1) {
        // Znajdź następnego członka (najstarszego stażem)
        const nextAdmin = team.members.find(member => 
          member.userId !== session.user.id
        )

        if (nextAdmin) {
          // Ustaw nowego administratora
          await prisma.teamMember.update({
            where: { id: nextAdmin.id },
            data: { role: "admin" }
          })

          // Dodaj wpis o zmianie administratora
          await prisma.activity.create({
            data: {
              type: "change_admin",
              description: `Automatycznie przydzielono rolę administratora w zespole: ${team.name}`,
              userId: nextAdmin.userId,
            },
          })
        }
      }
    }

    // Usuń użytkownika z zespołu
    await prisma.teamMember.delete({
      where: {
        id: teamMember.id,
      },
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "leave_team",
        description: `Opuszczono zespół: ${team.name}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, teamDeleted: false })
  } catch (error) {
    console.error("Error leaving team:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas opuszczania zespołu" },
      { status: 500 }
    )
  }
} 