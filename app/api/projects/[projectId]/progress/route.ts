import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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

    // Oblicz postęp dla każdej piosenki
    const songProgresses = songs.map(song => {
      // Najpierw sprawdź, czy piosenka jest zakończona
      if (song.status === "completed") {
        return 100
      }
      
      // Jeśli nie jest zakończona, sprawdź fazę
      switch (song.phase) {
        case "1": // Preprodukcja
          return song.status === "in_progress" ? 12.5 : 0
        case "2": // Produkcja
          return song.status === "in_progress" ? 37.5 : 25
        case "3": // Inżynieria
          return song.status === "in_progress" ? 62.5 : 50
        case "4": // Publishing
          return song.status === "in_progress" ? 87.5 : 75
        default:
          return 0
      }
    })

    // Oblicz średni postęp projektu
    const totalProgress = songProgresses.reduce((sum, progress) => sum + progress, 0) / songs.length

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

    // Oblicz postęp dla każdej piosenki
    const songProgresses = songs.map(song => {
      // Najpierw sprawdź, czy piosenka jest zakończona
      if (song.status === "completed") {
        return 100
      }
      
      // Jeśli nie jest zakończona, sprawdź fazę
      switch (song.phase) {
        case "1": // Preprodukcja
          return song.status === "in_progress" ? 12.5 : 0
        case "2": // Produkcja
          return song.status === "in_progress" ? 37.5 : 25
        case "3": // Inżynieria
          return song.status === "in_progress" ? 62.5 : 50
        case "4": // Publishing
          return song.status === "in_progress" ? 87.5 : 75
        default:
          return 0
      }
    })

    // Oblicz średni postęp projektu
    const totalProgress = songProgresses.reduce((sum, progress) => sum + progress, 0) / songs.length

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