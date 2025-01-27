import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    console.log("Otrzymane dane zadania:", data)

    // Walidacja wymaganych pól
    if (!data.title || !data.project_id || !data.phase_id) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól: title, project_id, phase_id" },
        { status: 400 }
      )
    }

    // Przygotowanie danych do zapisu
    const taskData = {
      title: data.title,
      description: data.description || null,
      status: data.status || "todo",
      priority: data.priority || "Średni",
      project_id: parseInt(data.project_id),
      phase_id: data.phase_id,
      song_id: data.song_id ? parseInt(data.song_id) : null,
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      created_by: session.user.id,
      assigned_to: data.assigned_to || [],
      responsible_user: data.responsible_user || null,
      planned_budget: data.planned_budget ? parseFloat(data.planned_budget) : null,
      actual_budget: data.actual_budget ? parseFloat(data.actual_budget) : null
    }

    console.log("Dane do zapisu:", taskData)

    const task = await prisma.task.create({
      data: taskData
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: "create_task",
        description: `Utworzono nowe zadanie: ${task.title}`,
        userId: session.user.id
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia zadania", details: error.message },
      { status: 500 }
    )
  }
} 