import { prisma } from "./prisma"
import type { Project, Activity, ProjectActivity, UserStats } from "@/types"

export async function fetchUserProjects(userId: string): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        created_at: "desc"
      }
    })

    return projects
  } catch (error) {
    console.error("Unexpected error fetching user projects:", error)
    return []
  }
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    const [activeProjects, completedProjects, upcomingDeadlines, recentActivity] = await Promise.all([
      prisma.project.count({
        where: {
          userId: userId,
          status: "active"
        }
      }),
      prisma.project.count({
        where: {
          userId: userId,
          status: "completed"
        }
      }),
      prisma.project.count({
        where: {
          userId: userId,
          due_date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.activity.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          created_at: "desc"
        },
        take: 3,
        select: {
          description: true,
          created_at: true
        }
      })
    ])

    const formattedActivity = recentActivity.map((activity) => ({
      description: activity.description,
      time: activity.created_at.toLocaleString()
    }))

    return {
      activeProjects,
      completedProjects,
      upcomingDeadlines,
      teamMembers: 0, // TODO: Implement team members count
      recentActivity: formattedActivity,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      activeProjects: 0,
      completedProjects: 0,
      upcomingDeadlines: 0,
      teamMembers: 0,
      recentActivity: [],
    }
  }
}

export async function fetchProjectActivity(userId: string): Promise<ProjectActivity[]> {
  try {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
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

    activities.forEach((activity: Activity) => {
      const itemDate = new Date(activity.created_at)
      const dayIndex = itemDate.getDay()
      activityByDay[dayIndex].projekty += activity.type === "create_project" ? 1 : 0
    })

    return activityByDay
  } catch (error) {
    console.error("Unexpected error fetching project activity:", error)
    return []
  }
}

