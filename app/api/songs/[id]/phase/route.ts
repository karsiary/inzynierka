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

    const songId = parseInt(params.id)
    const { phase } = await req.json()

    if (isNaN(songId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID piosenki" },
        { status: 400 }
      )
    }

    // Aktualizacja fazy piosenki
    const song = await prisma.song.update({
      where: { id: songId },
      data: { phase: phase },
      include: {
        authors: {
          include: {
            user: true,
            team: true
          }
        }
      }
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "update_song_phase",
        description: `Zaktualizowano fazę piosenki "${song.title}" na ${phase}`,
        userId: session.user.id
      }
    })

    // Pobierz wszystkie piosenki z projektu
    const songs = await prisma.song.findMany({
      where: { projectId: song.projectId }
    })

    // Oblicz postęp dla każdej piosenki
    const songProgresses = songs.map(song => {
      // Najpierw sprawdź, czy piosenka jest zakończona
      if (song.status === "completed") {
        return 100
      }
      
      // Jeśli nie jest zakończona, sprawdź fazę
      switch (song.phase) {
        case "1": // Preprodukcja
          return 0
        case "2": // Produkcja
          return 25
        case "3": // Inżynieria
          return 50
        case "4": // Publishing
          return 75
        default:
          return 0
      }
    })

    // Oblicz średni postęp projektu
    const totalProgress = songProgresses.reduce((sum, progress) => sum + progress, 0) / songs.length

    // Zaktualizuj postęp projektu
    await prisma.project.update({
      where: { id: song.projectId },
      data: { progress: totalProgress }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error("Error updating song phase:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji fazy piosenki" },
      { status: 500 }
    )
  }
} 