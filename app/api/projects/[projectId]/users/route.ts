import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
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

    // Pobierz projekt wraz z członkami i zespołami
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
        teams: {
          include: {
            team: {
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
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Zbierz wszystkich użytkowników z projektu
    const projectUsers = project.members.map(member => member.user)
    const teamUsers = project.teams.flatMap(projectTeam => 
      projectTeam.team.members.map(teamMember => teamMember.user)
    )

    // Połącz i usuń duplikaty
    const allUsers = [...projectUsers, ...teamUsers]
    const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.id, user])).values())

    return NextResponse.json(uniqueUsers)
  } catch (error) {
    console.error("Error fetching project users:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania użytkowników projektu" },
      { status: 500 }
    )
  }
} 