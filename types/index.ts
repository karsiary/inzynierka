import { Project as PrismaProject, Activity as PrismaActivity } from "@prisma/client"

export type Project = PrismaProject

export type Activity = PrismaActivity

export type ProjectActivity = {
  name: string
  projekty: number
  date: Date
}

export type ActivityItem = {
  description: string
  time: string
}

export type UserStats = {
  activeProjects: number
  completedProjects: number
  upcomingDeadlines: number
  teamMembers: number
  recentActivity: ActivityItem[]
} 