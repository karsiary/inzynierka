import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createNotification, getProjectUrl } from "@/lib/notifications"
import { NotificationType } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")?.trim() || ""
    const statusFilter = searchParams.get("status")

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const searchCondition = query ? {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } }
      ]
    } : {}

    const statusCondition = statusFilter ? {
      ...(statusFilter === "active" ? { progress: { lt: 100 } } : {}),
      ...(statusFilter === "completed" ? { progress: 100 } : {})
    } : {}

    const [myProjects, teamProjects, memberProjects] = await Promise.all([
      // Projekty, których jestem właścicielem
      prisma.project.findMany({
        where: {
          AND: [
            { userId },
            searchCondition,
            statusCondition
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          teams: {
            include: {
              team: {
                include: {
                  members: true
                }
              }
            }
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
          }
        },
        orderBy: { created_at: 'desc' }
      }),

      // Projekty zespołów, w których jestem
      prisma.project.findMany({
        where: {
          AND: [
            { userId: { not: userId } },
            { teams: { some: { team: { members: { some: { userId } } } } } },
            searchCondition,
            statusCondition
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          teams: {
            include: {
              team: {
                include: {
                  members: true
                }
              }
            }
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
          }
        },
        orderBy: { created_at: 'desc' }
      }),

      // Projekty, w których jestem członkiem
      prisma.project.findMany({
        where: {
          AND: [
            { userId: { not: userId } },
            { members: { some: { userId } } },
            { teams: { none: { team: { members: { some: { userId } } } } } },
            searchCondition,
            statusCondition
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          teams: {
            include: {
              team: {
                include: {
                  members: true
                }
              }
            }
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
          }
        },
        orderBy: { created_at: 'desc' }
      })
    ])

    // Łączymy wszystkie projekty
    const allProjects = [...myProjects, ...teamProjects, ...memberProjects]

    return NextResponse.json(allProjects)
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
            team: {
              include: {
                members: true
              }
            },
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

    // Wyślij powiadomienia do wszystkich członków projektu (oprócz twórcy)
    const creatorName = session.user.name || "Administrator"
    if (users?.length > 0) {
      const notificationPromises = users
        .filter((user: any) => user.id !== session.user.id)
        .map((user: any) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              type: NotificationType.PROJECT_INVITE,
              title: "Dodano do projektu",
              message: `Zostałeś dodany do projektu ${name} przez ${creatorName}.`,
              targetId: String(project.id),
              actionUrl: getProjectUrl(String(project.id)),
            }
          })
        )

      await Promise.all(notificationPromises)
    }

    // Wyślij powiadomienia do członków zespołów (oprócz twórcy)
    if (project.teams?.length > 0) {
      const teamNotificationPromises = project.teams.map(async (teamItem: any) => {
        if (teamItem.team && teamItem.team.members?.length > 0) {
          return Promise.all(
            teamItem.team.members
              .filter((member: any) => member.userId !== session.user.id)
              .map((member: any) =>
                prisma.notification.create({
                  data: {
                    userId: member.userId,
                    type: NotificationType.PROJECT_INVITE,
                    title: "Zespół przypisany do projektu",
                    message: `Twój zespół ${teamItem.team.name} został dodany do projektu ${project.name} przez ${creatorName}.`,
                    targetId: String(project.id),
                    actionUrl: getProjectUrl(String(project.id)),
                  },
                })
              )
          );
        }
      });
      await Promise.all(teamNotificationPromises);
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia projektu" },
      { status: 500 }
    )
  }
} 