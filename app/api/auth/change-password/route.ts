import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
    }

    // Pobranie użytkownika z bazy
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika" }, { status: 404 });
    }

    // Weryfikacja poprawności obecnego hasła
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Obecne hasło jest nieprawidłowe" }, { status: 400 });
    }

    // Aktualizacja hasła – generujemy hash nowego hasła
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd zmiany hasła:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zmiany hasła" },
      { status: 500 }
    );
  }
} 