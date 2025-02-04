import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateProjectProgress } from "@/app/utils/progress"

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectId = parseInt(params.projectId, 10)
    const songId = parseInt(params.id, 10)

    if (isNaN(projectId) || isNaN(songId)) {
      return NextResponse.json(
        { error: "Invalid project ID or song ID" },
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

    // Sprawdź czy piosenka należy do wskazanego projektu
    if (song.projectId !== projectId) {
      return NextResponse.json(
        { error: "Song does not belong to this project" },
        { status: 400 }
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

    // Usuń piosenkę
    await prisma.song.delete({
      where: { id: songId }
    })

    // Pobierz wszystkie pozostałe piosenki projektu
    const remainingSongs = await prisma.song.findMany({
      where: { projectId }
    })

    // Oblicz nowy postęp projektu
    const totalProgress = calculateProjectProgress(remainingSongs)

    // Zaktualizuj postęp projektu w bazie danych
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        progress: totalProgress,
        status: totalProgress === 100 ? "completed" : "active"
      }
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "delete_song",
        description: `Usunięto piosenkę: ${song.title}`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting song:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 