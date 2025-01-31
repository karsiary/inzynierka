import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const songId = parseInt(params.id, 10)

    if (isNaN(songId)) {
      return NextResponse.json(
        { error: "Invalid song ID" },
        { status: 400 }
      )
    }

    const { phase } = await req.json()

    if (!phase || !["1", "2", "3", "4"].includes(phase)) {
      return NextResponse.json(
        { error: "Invalid phase value" },
        { status: 400 }
      )
    }

    // Sprawdź czy piosenka istnieje i czy użytkownik ma do niej dostęp
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: true,
            teams: {
              include: {
                team: {
                  include: {
                    members: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      )
    }

    // Sprawdź uprawnienia
    const isProjectMember = song.project.members.some(member => member.userId === session.user.id)
    const isTeamMember = song.project.teams.some(pt => 
      pt.team.members.some(tm => tm.userId === session.user.id)
    )

    if (!isProjectMember && !isTeamMember) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Aktualizuj fazę piosenki
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: { phase }
    })

    // Aktualizuj postęp projektu
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${song.projectId}/progress`, {
      method: 'PUT'
    })

    return NextResponse.json(updatedSong)
  } catch (error) {
    console.error("Error updating song phase:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 