import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
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
            team: true,
          },
        },
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
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania projektów" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      name,
      description,
      startDate,
      endDate,
      budgetType,
      budgetGlobal,
      budgetPhases,
      teams,
      users,
      songs,
    } = await req.json()

    // Walidacja podstawowych danych
    if (!name) {
      return NextResponse.json(
        { error: "Nazwa projektu jest wymagana" },
        { status: 400 }
      )
    }

    // Tworzenie projektu
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budgetType: budgetType || "global",
        budgetGlobal: budgetGlobal ? Number(budgetGlobal) : null,
        budgetPhase1: budgetPhases?.[0] ? Number(budgetPhases[0]) : null,
        budgetPhase2: budgetPhases?.[1] ? Number(budgetPhases[1]) : null,
        budgetPhase3: budgetPhases?.[2] ? Number(budgetPhases[2]) : null,
        budgetPhase4: budgetPhases?.[3] ? Number(budgetPhases[3]) : null,
        members: {
          create: [
            {
              userId: session.user.id,
              role: "admin",
            },
            ...(users || [])
              .filter((user: any) => user.id !== session.user.id)
              .map((user: any) => ({
                userId: user.id,
                role: "member",
              })),
          ],
        },
        teams: {
          create: (teams || []).map((team: any) => ({
            teamId: team.id,
          })),
        },
        songs: {
          create: (songs || []).map((song: any) => ({
            title: song.title,
            status: "pending",
            authors: {
              create: song.authors.map((author: any) => ({
                type: author.type,
                ...(author.type === 'user' ? { userId: author.id } : {}),
                ...(author.type === 'team' ? { teamId: author.id } : {}),
              })),
            },
          })),
        },
      },
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
            team: true,
          },
        },
        songs: {
          include: {
            authors: {
              include: {
                user: true,
                team: true,
              },
            },
          },
        },
      },
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "create_project",
        description: `Utworzono projekt: ${name}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia projektu" },
      { status: 500 }
    )
  }
} 