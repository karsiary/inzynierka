import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getTaskUrl } from "@/lib/notifications"
import { NotificationType } from "@prisma/client"

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
      title: String(data.title).trim(),
      description: data.description ? String(data.description).trim() : null,
      status: String(data.status || "todo"),
      priority: String(data.priority || "Średni"),
      project_id: Number(data.project_id),
      phase_id: String(data.phase_id),
      song_id: data.song_id ? Number(data.song_id) : null,
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      due_date: data.due_date ? new Date(data.due_date) : null,
      created_by: String(session.user.id),
      responsible_user: data.responsible_user ? String(data.responsible_user) : null,
      activityType: data.activityType || null,
    }

    if (data.planned_budget) {
      taskData.planned_budget = Number(data.planned_budget)
    }

    if (data.actual_budget) {
      taskData.actual_budget = Number(data.actual_budget)
    }

    console.log("Dane do zapisu:", taskData)

    const task = await prisma.task.create({
      data: taskData,
      include: {
        assignees: true,
        responsible: true,
        creator: true,
        project: true,
        song: true
      }
    })

    // Jeśli są przypisani użytkownicy, dodaj ich
    if (data.assigned_to?.length > 0) {
      await prisma.taskAssignee.createMany({
        data: data.assigned_to.map((userId: string) => ({
          taskId: task.id,
          userId: String(userId)
        }))
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "create_task",
        description: `Utworzono nowe zadanie: ${task.title}`,
        userId: session.user.id
      }
    })

    // Wyślij powiadomienia
    const creatorName = session.user.name || "Administrator"
    const notificationPromises: Promise<any>[] = []

    // Powiadomienie dla osoby odpowiedzialnej
    if (task.responsible_user && task.responsible_user !== session.user.id) {
      notificationPromises.push(
        prisma.notification.create({
          data: {
            userId: task.responsible_user,
            type: NotificationType.TASK_ASSIGNMENT,
            title: "Przypisano odpowiedzialność za zadanie",
            message: `Zostałeś wyznaczony jako osoba odpowiedzialna za zadanie "${task.title}" przez ${creatorName}.`,
            targetId: String(task.id),
            actionUrl: getTaskUrl(String(task.project_id), String(task.id)),
          }
        })
      )
    }

    // Powiadomienia dla przypisanych osób
    if (data.assigned_to?.length > 0) {
      const assigneeNotifications = data.assigned_to
        .filter((userId: string) => userId !== session.user.id && userId !== task.responsible_user)
        .map((userId: string) =>
          prisma.notification.create({
            data: {
              userId: userId,
              type: NotificationType.TASK_ASSIGNMENT,
              title: "Przypisano do zadania",
              message: `Zostałeś przypisany do zadania "${task.title}" przez ${creatorName}.`,
              targetId: String(task.id),
              actionUrl: getTaskUrl(String(task.project_id), String(task.id)),
            }
          })
        )

      notificationPromises.push(...assigneeNotifications)
    }

    await Promise.all(notificationPromises)

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia zadania", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Pobierz wszystkie zadania z pełnymi informacjami
    const tasks = await prisma.task.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
          }
        },
        song: {
          select: {
            id: true,
            title: true,
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
      where: {
        OR: [
          { created_by: session.user.id },
          { responsible_user: session.user.id },
          { assignees: { some: { userId: session.user.id } } }
        ]
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania zadań" },
      { status: 500 }
    )
  }
} 