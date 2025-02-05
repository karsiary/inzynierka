import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createNotification, getTaskUrl } from "@/lib/notifications"
import { NotificationType } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const taskId = parseInt(params.id)
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zadania" },
        { status: 400 }
      )
    }

    const { content } = await request.json()
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Treść komentarza jest wymagana" },
        { status: 400 }
      )
    }

    // Pobierz zadanie wraz z przypisanymi osobami i osobą odpowiedzialną
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: true,
        responsible: true,
        creator: true,
        project: true,
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Zadanie nie istnieje" },
        { status: 404 }
      )
    }

    // Dodaj komentarz
    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        userId: session.user.id
      },
      include: {
        user: true
      }
    })

    // Dodaj wpis o aktywności
    await prisma.activity.create({
      data: {
        type: "add_comment",
        description: `Dodano komentarz do zadania: ${task.title}`,
        userId: session.user.id
      }
    })

    // Zbierz unikalne ID użytkowników do powiadomienia
    const usersToNotify = new Set<string>()

    // Dodaj twórcę zadania
    if (task.created_by !== session.user.id) {
      usersToNotify.add(task.created_by)
    }

    // Dodaj osobę odpowiedzialną
    if (task.responsible_user && task.responsible_user !== session.user.id) {
      usersToNotify.add(task.responsible_user)
    }

    // Dodaj przypisanych użytkowników
    task.assignees.forEach(assignee => {
      if (assignee.userId !== session.user.id) {
        usersToNotify.add(assignee.userId)
      }
    })

    // Wyślij powiadomienia
    const creatorName = session.user.name || "Administrator"
    const notificationPromises = Array.from(usersToNotify).map(userId =>
      prisma.notification.create({
        data: {
          userId,
          type: NotificationType.TASK_COMMENT,
          title: "Nowy komentarz w zadaniu",
          message: `${creatorName} dodał komentarz do zadania "${task.title}": ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          targetId: String(taskId),
          actionUrl: getTaskUrl(String(task.project_id), String(taskId), "comments"),
        }
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas dodawania komentarza" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const taskId = parseInt(params.id)
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zadania" },
        { status: 400 }
      )
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania komentarzy" },
      { status: 500 }
    )
  }
} 