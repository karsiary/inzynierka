import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    
    if (!session?.user) {
      console.log("Brak sesji użytkownika")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = parseInt(params.projectId, 10)
    console.log("Próba pobrania projektu o ID:", projectId)

    if (isNaN(projectId)) {
      console.log("Nieprawidłowe ID projektu")
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          songs: {
            include: {
              authors: {
                include: {
                  user: true,
                  team: true
                }
              }
            }
          },
          members: {
            include: {
              user: true
            }
          },
          teams: {
            include: {
              team: {
                include: {
                  members: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      console.log("Znaleziony projekt:", project)

      if (!project) {
        console.log("Projekt nie znaleziony w bazie")
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      // Sprawdź czy użytkownik ma dostęp do projektu
      const isCreator = project.userId === session.user.id
      const isMember = project.members.some(member => member.userId === session.user.id)
      const isTeamMember = project.teams.some(pt => 
        pt.team.members.some(tm => tm.userId === session.user.id)
      )

      console.log("Uprawnienia:", {
        isCreator,
        isMember,
        isTeamMember,
        userId: session.user.id,
        projectUserId: project.userId
      })

      if (!isCreator && !isMember && !isTeamMember) {
        console.log("Brak uprawnień do projektu")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      return NextResponse.json(project)
    } catch (dbError) {
      console.error("Błąd bazy danych:", dbError)
      return NextResponse.json(
        { error: "Database Error", details: dbError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
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

    // Sprawdź czy projekt istnieje i czy użytkownik ma do niego uprawnienia
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
        teams: true,
        songs: {
          include: {
            authors: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Sprawdź czy użytkownik jest właścicielem projektu
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - only project owner can delete the project" },
        { status: 403 }
      )
    }

    try {
      // 1. Usuń komentarze i checklisty dla wszystkich zadań
      const tasks = await prisma.task.findMany({
        where: { project_id: projectId }
      })

      for (const task of tasks) {
        await prisma.comment.deleteMany({
          where: { task_id: task.id }
        })
        await prisma.checklistItem.deleteMany({
          where: { task_id: task.id }
        })
      }

      // 2. Usuń wszystkie zadania
      await prisma.task.deleteMany({
        where: { project_id: projectId }
      })

      // 3. Usuń autorów piosenek
      for (const song of project.songs) {
        await prisma.songAuthor.deleteMany({
          where: { songId: song.id }
        })
      }

      // 4. Usuń piosenki
      await prisma.song.deleteMany({
        where: { projectId }
      })

      // 5. Usuń powiązania z zespołami
      await prisma.projectTeam.deleteMany({
        where: { projectId }
      })

      // 6. Usuń członków projektu
      await prisma.projectMember.deleteMany({
        where: { projectId }
      })

      // 7. Na końcu usuń sam projekt
      await prisma.project.delete({
        where: { id: projectId }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Szczegóły błędu podczas usuwania:", error)
      return NextResponse.json(
        { error: "Wystąpił błąd podczas usuwania projektu" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Błąd główny:", error)
    return NextResponse.json(
      { error: "Wystąpił nieoczekiwany błąd" },
      { status: 500 }
    )
  }
} 