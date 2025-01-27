import { hash } from "bcryptjs"
import { prisma } from "./prisma"

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (existingUser) {
    throw new Error("Użytkownik z tym adresem email już istnieje")
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name
  }
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email
    }
  })
} 