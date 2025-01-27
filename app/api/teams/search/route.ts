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
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    // Wyszukaj zespoły, do których należy użytkownik
    const teams = await prisma.team.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query,
            },
          },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      take: 5,
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error searching teams:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wyszukiwania zespołów" },
      { status: 500 }
    )
  }
} 