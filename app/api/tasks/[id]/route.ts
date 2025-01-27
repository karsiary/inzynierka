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

    // Aktualizujemy tylko status
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: data.status
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: "update_task_status",
        description: `Zmieniono status zadania "${task.title}" na ${data.status}`,
        userId: session.user.id
      }
    })

    return NextResponse.json(task)
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

    const taskId = params.id

    const task = await prisma.task.delete({
      where: { id: taskId }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: "delete_task",
        description: `Usunięto zadanie: ${task.name}`,
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