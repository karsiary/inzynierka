import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectId = parseInt(params.projectId, 10)
    const userId = params.userId

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const { projectRole, userRoles } = await request.json()

    // Sprawdź czy projekt istnieje
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Sprawdź czy użytkownik jest administratorem projektu lub edytuje własne role
    const isAdmin = project.members.some(
      member => member.userId === session.user.id && member.role === "admin"
    )

    // Pozwól na edycję jeśli użytkownik jest adminem lub edytuje własne role
    if (!isAdmin && project.userId !== session.user.id && userId !== session.user.id) {
      return NextResponse.json(
        { error: "Brak uprawnień do edycji ról" },
        { status: 403 }
      )
    }

    // Jeśli użytkownik nie jest adminem, może tylko edytować userRoles, nie projectRole
    if (!isAdmin && userId === session.user.id) {
      const updatedMember = await prisma.projectMember.update({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        },
        data: {
          userRoles: Array.isArray(userRoles) ? JSON.stringify(userRoles) : userRoles
        }
      })
      return NextResponse.json(updatedMember)
    }

    // Dla administratora - pełna edycja
    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      data: {
        role: projectRole,
        userRoles: Array.isArray(userRoles) ? JSON.stringify(userRoles) : userRoles
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating member roles:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji ról" },
      { status: 500 }
    )
  }
} 