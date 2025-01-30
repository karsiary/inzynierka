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
      prisma.project.findMany({
        where: projectAccessCondition,
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
        orderBy: {
          created_at: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      // Pobierz całkowitą liczbę projektów
      prisma.project.count({
        where: projectAccessCondition
      }),

      // Pobierz statystyki
      Promise.all([
        prisma.project.count({
          where: {
            AND: [projectAccessCondition, { status: "active" }]
          }
        }),
        prisma.project.count({
          where: {
            AND: [projectAccessCondition, { status: "completed" }]
          }
        }),
        prisma.project.count({
          where: {
            AND: [
              projectAccessCondition,
              {
                due_date: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
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
          where: { userId }
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

    const [activeProjects, completedProjects, upcomingDeadlines, recentActivity, teamMembersCount] = stats

    return NextResponse.json({
      projects,
      totalProjects,
      stats: {
        activeProjects,
        completedProjects,
        upcomingDeadlines,
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