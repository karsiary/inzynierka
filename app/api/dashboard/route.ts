import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 4 // Stała liczba projektów na stronę

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const projectAccessCondition = {
      OR: [
        { userId },
        { members: { some: { userId } } },
        { teams: { some: { team: { members: { some: { userId } } } } } }
      ]
    }

    const [projects, totalProjects, stats, activity] = await Promise.all([
      // Pobierz projekty z paginacją
      (async () => {
        // Pobierz wszystkie projekty dla użytkownika
        const myProjects = await prisma.project.findMany({
          where: { userId },
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
                team: true
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
        });

        const teamProjects = await prisma.project.findMany({
          where: {
            AND: [
              { userId: { not: userId } },
              { teams: { some: { team: { members: { some: { userId } } } } } }
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
                team: true
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
        });

        const memberProjects = await prisma.project.findMany({
          where: {
            AND: [
              { userId: { not: userId } },
              { members: { some: { userId } } },
              { teams: { none: { team: { members: { some: { userId } } } } } }
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
                team: true
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
        });

        // Połącz wszystkie projekty w odpowiedniej kolejności
        const allProjects = [...myProjects, ...teamProjects, ...memberProjects];
        
        // Zastosuj paginację
        const start = (page - 1) * limit;
        const end = start + limit;
        return allProjects.slice(start, end);
      })(),

      // Pobierz całkowitą liczbę projektów
      (async () => {
        const [myProjectsCount, teamProjectsCount, memberProjectsCount] = await Promise.all([
          prisma.project.count({
            where: { userId }
          }),
          prisma.project.count({
            where: {
              AND: [
                { userId: { not: userId } },
                { teams: { some: { team: { members: { some: { userId } } } } } }
              ]
            }
          }),
          prisma.project.count({
            where: {
              AND: [
                { userId: { not: userId } },
                { members: { some: { userId } } },
                { teams: { none: { team: { members: { some: { userId } } } } } }
              ]
            }
          })
        ]);
        return myProjectsCount + teamProjectsCount + memberProjectsCount;
      })(),

      // Pobierz statystyki
      Promise.all([
        prisma.project.count({
          where: {
            AND: [projectAccessCondition, { status: "active" }]
          }
        }),
        prisma.project.count({
          where: {
            AND: [
              projectAccessCondition,
              {
                endDate: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)
                }
              }
            ]
          }
        }),
        prisma.project.count({
          where: {
            AND: [
              projectAccessCondition,
              {
                OR: [
                  { status: "completed" },
                  { progress: 100 }
                ]
              }
            ]
          }
        }),
        prisma.activity.findMany({
          where: { userId },
          orderBy: { created_at: "desc" },
          take: 3,
          select: {
            description: true,
            created_at: true
          }
        }),
        prisma.teamMember.count({
          where: { 
            userId,
            role: {
              not: "owner"
            }
          }
        })
      ]),

      // Pobierz aktywność projektową
      (async () => {
        const today = new Date()
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

        const activities = await prisma.activity.findMany({
          where: {
            userId,
            created_at: {
              gte: startOfWeek,
              lte: endOfWeek
            }
          },
          orderBy: {
            created_at: "asc"
          }
        })

        const weekDays = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"]
        const activityByDay = weekDays.map((day, index) => ({
          name: day,
          projekty: 0,
          date: new Date(startOfWeek.getTime() + index * 24 * 60 * 60 * 1000),
        }))

        activities.forEach((activity) => {
          const itemDate = new Date(activity.created_at)
          const dayIndex = itemDate.getDay()
          activityByDay[dayIndex].projekty += activity.type === "create_project" ? 1 : 0
        })

        return activityByDay
      })()
    ])

    const [activeProjects, upcomingProjects, completedProjects, recentActivity, teamMembersCount] = stats

    return NextResponse.json({
      projects,
      totalProjects,
      stats: {
        activeProjects,
        upcomingProjects,
        completedProjects,
        teamMembers: teamMembersCount,
        recentActivity: recentActivity.map((activity) => ({
          description: activity.description,
          time: activity.created_at.toLocaleString()
        }))
      },
      activity
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania danych" },
      { status: 500 }
    )
  }
} 