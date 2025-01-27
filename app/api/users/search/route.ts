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
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      )
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query,
            },
          },
          {
            name: {
              contains: query,
            },
          },
        ],
        NOT: {
          id: session.user.id, // Wykluczamy aktualnego użytkownika z wyników
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5, // Limit wyników
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wyszukiwania użytkowników" },
      { status: 500 }
    )
  }
} 