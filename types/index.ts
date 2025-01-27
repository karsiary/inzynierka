import { Project as PrismaProject, Activity as PrismaActivity, Team as PrismaTeam, TeamMember as PrismaTeamMember, User as PrismaUser } from "@prisma/client"

export type Project = PrismaProject

export type Activity = PrismaActivity

export type Team = PrismaTeam & {
  members: (TeamMember & {
    user: User
  })[]
}

export type TeamMember = PrismaTeamMember

export type User = Pick<PrismaUser, "id" | "name" | "email" | "image">

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