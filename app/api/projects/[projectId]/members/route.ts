import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = parseInt(params.projectId, 10)
    const { userId, projectRole, userRoles } = await request.json()

    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    // Sprawdź, czy projekt istnieje i czy użytkownik ma uprawnienia admina
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Sprawdź, czy użytkownik jest adminem projektu
    const isAdmin = project.members.some(
      member => member.userId === session.user.id && member.projectRole === "admin"
    )

    if (!isAdmin && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Only project admin can add members" },
        { status: 403 }
      )
    }

    // Sprawdź, czy użytkownik już nie jest członkiem projektu
    const existingMember = project.members.find(member => member.userId === userId)
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      )
    }

    // Dodaj użytkownika do projektu
    const newMember = await prisma.projectMember.create({
      data: {
        userId: userId,
        projectId: projectId,
        role: projectRole || "user",
        userRoles: JSON.stringify(userRoles || [])
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Error adding project member:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 