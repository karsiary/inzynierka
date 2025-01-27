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