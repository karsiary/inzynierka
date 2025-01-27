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

    const task = await prisma.task.create({
      data: {
        ...data,
        created_by: session.user.id
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: "create_task",
        description: `Utworzono nowe zadanie: ${task.name}`,
        userId: session.user.id
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia zadania" },
      { status: 500 }
    )
  }
} 