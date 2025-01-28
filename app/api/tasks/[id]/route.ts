import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    const taskId = parseInt(params.id)

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zadania" },
        { status: 400 }
      )
    }

    // Przygotowanie danych do aktualizacji
    const updateData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      due_date: data.due_date ? new Date(data.due_date) : null,
      phase_id: data.phase_id,
      project_id: data.project_id,
      song_id: data.song_id,
      responsible_user: data.responsible_user,
      planned_budget: data.planned_budget,
      actual_budget: data.actual_budget,
      activityType: data.activityType,
    }

    // Aktualizacja zadania
    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        checklistItems: true,
        comments: true
      }
    })

    // Aktualizacja elementów checklisty
    if (data.checklist) {
      // Usuwamy istniejące elementy checklisty
      await prisma.taskChecklistItem.deleteMany({
        where: { taskId }
      })

      // Dodajemy nowe elementy checklisty
      if (data.checklist.length > 0) {
        await prisma.taskChecklistItem.createMany({
          data: data.checklist.map((item: any) => ({
            taskId,
            content: item.text,
            isCompleted: item.completed
          }))
        })
      }
    }

    // Aktualizacja komentarzy
    if (data.comments) {
      // Usuwamy istniejące komentarze
      await prisma.taskComment.deleteMany({
        where: { taskId }
      })

      // Dodajemy nowe komentarze
      if (data.comments.length > 0) {
        await prisma.taskComment.createMany({
          data: data.comments.map((comment: any) => ({
            taskId,
            content: comment.text,
            userId: session.user.id
          }))
        })
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "update_task",
        description: `Zaktualizowano zadanie "${task.title}"`,
        userId: session.user.id
      }
    })

    // Pobieramy zaktualizowane zadanie ze wszystkimi relacjami
    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        checklistItems: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji zadania" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    const task = await prisma.task.delete({
      where: { id: taskId }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: "delete_task",
        description: `Usunięto zadanie: ${task.title}`,
        userId: session.user.id
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania zadania" },
      { status: 500 }
    )
  }
} 