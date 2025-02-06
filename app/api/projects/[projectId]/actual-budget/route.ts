import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
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

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    // Pobierz sumę actual_budget dla wszystkich zadań w projekcie
    const result = await prisma.task.aggregate({
      where: { project_id: projectId },
      _sum: {
        actual_budget: true
      }
    })

    const totalActualBudget = result._sum.actual_budget || 0

    return NextResponse.json({ totalActualBudget })
  } catch (error) {
    console.error("Error calculating total actual budget:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 