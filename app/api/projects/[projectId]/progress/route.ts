import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateProjectProgress } from "@/app/utils/progress"

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
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

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    // Pobierz wszystkie piosenki z projektu
    const songs = await prisma.song.findMany({
      where: { projectId }
    })

    if (!songs || songs.length === 0) {
      return NextResponse.json({ progress: 0 })
    }

    // Oblicz postęp projektu używając funkcji pomocniczej
    const totalProgress = calculateProjectProgress(songs)

    // Zaktualizuj postęp projektu w bazie danych
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        progress: totalProgress,
        status: totalProgress === 100 ? "completed" : "active"
      }
    })

    return NextResponse.json({ progress: totalProgress })
  } catch (error) {
    console.error("Error calculating project progress:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
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

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    // Pobierz wszystkie piosenki z projektu
    const songs = await prisma.song.findMany({
      where: { projectId }
    })

    if (!songs || songs.length === 0) {
      return NextResponse.json({ progress: 0 })
    }

    // Oblicz postęp projektu używając funkcji pomocniczej
    const totalProgress = calculateProjectProgress(songs)

    // Zaktualizuj postęp projektu w bazie danych
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        progress: totalProgress,
        status: totalProgress === 100 ? "completed" : "active"
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project progress:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 