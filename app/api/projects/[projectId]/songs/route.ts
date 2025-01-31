import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
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

    const { title, authors } = await req.json()

    if (!title || !authors || authors.length === 0) {
      return NextResponse.json(
        { error: "Title and authors are required" },
        { status: 400 }
      )
    }

    // Sprawdź czy projekt istnieje i czy użytkownik ma do niego dostęp
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Sprawdź uprawnienia
    const isProjectMember = project.members.some(member => member.userId === session.user.id)
    const isTeamMember = project.teams.some(pt => 
      pt.team.members.some(tm => tm.userId === session.user.id)
    )

    if (!isProjectMember && !isTeamMember) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Utwórz nową piosenkę
    const song = await prisma.song.create({
      data: {
        title,
        status: "pending",
        phase: "1",
        projectId,
        authors: {
          create: authors.map((author: any) => ({
            type: author.type,
            ...(author.type === 'user' ? { userId: author.id } : {}),
            ...(author.type === 'team' ? { teamId: author.id } : {})
          }))
        }
      },
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
        type: "create_song",
        description: `Dodano nową piosenkę: ${title}`,
        userId: session.user.id
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 