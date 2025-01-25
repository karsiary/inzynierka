import { supabase } from "./supabase"

export async function fetchUserProjects(userId: string) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user projects:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching user projects:", error)
    return []
  }
}

export async function fetchUserStats(userId: string) {
  try {
    const [activeProjects, completedProjects, upcomingDeadlines, recentActivity] = await Promise.all([
      supabase.from("projects").select("count").eq("user_id", userId).eq("status", "active").single(),
      supabase.from("projects").select("count").eq("user_id", userId).eq("status", "completed").single(),
      supabase
        .from("projects")
        .select("count")
        .eq("user_id", userId)
        .gte("due_date", new Date().toISOString())
        .lte("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .single(),
      supabase.from("activity").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    ])

    return {
      activeProjects: activeProjects.data?.count || 0,
      completedProjects: completedProjects.data?.count || 0,
      upcomingDeadlines: upcomingDeadlines.data?.count || 0,
      recentActivity: recentActivity.data || [],
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      activeProjects: 0,
      completedProjects: 0,
      upcomingDeadlines: 0,
      recentActivity: [],
    }
  }
}

export async function fetchProjectActivity(userId: string) {
  try {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

    const { data, error } = await supabase
      .from("activity")
      .select("created_at, action")
      .eq("user_id", userId)
      .gte("created_at", startOfWeek.toISOString())
      .lte("created_at", endOfWeek.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching project activity:", error)
      return []
    }

    const weekDays = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"]
    const activityByDay = weekDays.map((day, index) => ({
      name: day,
      projekty: 0,
      date: new Date(startOfWeek.getTime() + index * 24 * 60 * 60 * 1000),
    }))

    data.forEach((item) => {
      const itemDate = new Date(item.created_at)
      const dayIndex = itemDate.getDay()
      activityByDay[dayIndex].projekty += item.action === "create_project" ? 1 : 0
    })

    return activityByDay
  } catch (error) {
    console.error("Unexpected error fetching project activity:", error)
    return []
  }
}

