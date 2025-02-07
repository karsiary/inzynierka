import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { firstName, lastName, email } = await req.json()
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Brakujące dane" }, { status: 400 })
    }
    
    const fullName = `${firstName.trim()} ${lastName.trim()}`

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name: fullName, 
        email 
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych użytkownika:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji danych użytkownika" },
      { status: 500 }
    )
  }
} 