import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session?.user?.id) {
      console.log("Brak autoryzacji")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectId = parseInt(params.projectId, 10)
    console.log("ProjectId:", projectId)

    if (isNaN(projectId)) {
      console.log("Nieprawidłowe ID projektu")
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)
    const songIdStr = searchParams.get('songId')
    console.log("SongId string:", songIdStr)
    
    const songId = songIdStr === 'all' ? null : parseInt(songIdStr, 10)
    console.log("SongId parsed:", songId)

    try {
      console.log("Parametry zapytania do bazy:", {
        project_id: projectId,
        phase_id: params.phaseId,
        song_id: songId
      })

      const tasks = await prisma.task.findMany({
        where: {
          project_id: projectId,
          phase_id: params.phaseId,
          ...(songId ? { song_id: songId } : {})
        },
        include: {
          assignees: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true
                }
              }
            }
          },
          responsible: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          comments: true,
          checklistItems: true
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      console.log("Znalezione zadania w bazie:", tasks)

      // Transform the data to match the expected format
      const formattedTasks = tasks.map(task => ({
        ...task,
        assignees: task.assignees.map(assignee => ({
          name: assignee.user.name,
          avatar: assignee.user.image
        })),
        commentsCount: task.comments.length,
        checklistStats: {
          total: task.checklistItems.length,
          completed: task.checklistItems.filter(item => item.isCompleted).length
        }
      }))

      console.log("Sformatowane zadania:", formattedTasks)

      return NextResponse.json(formattedTasks)
    } catch (dbError) {
      console.error("Błąd bazy danych:", dbError)
      return NextResponse.json(
        { error: "Database Error", details: dbError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
} 