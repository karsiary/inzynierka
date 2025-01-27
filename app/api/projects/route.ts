import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    // Verify that the user is requesting their own projects
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania projektów" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectData = await req.json()

    // Tworzenie projektu
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        status: "active",
        progress: 0,
        role: "owner",
        due_date: projectData.endDate ? new Date(projectData.endDate) : null,
        phase: "planning",
        budget_planned: projectData.budgetType === "global" ? projectData.budgetGlobal : 0,
        budget_actual: 0,
        userId: session.user.id,
      }
    })

    // Dodawanie piosenek
    if (projectData.songs && projectData.songs.length > 0) {
      await prisma.song.createMany({
        data: projectData.songs.map((song: any) => ({
          name: song.title,
          status: "pending",
          projectId: project.id,
        }))
      })
    }

    // Dodawanie wpisu o aktywności
    await prisma.activity.create({
      data: {
        type: "create_project",
        description: `Utworzono projekt: ${projectData.name}`,
        userId: session.user.id,
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia projektu" },
      { status: 500 }
    )
  }
} 