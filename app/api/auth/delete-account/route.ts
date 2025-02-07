import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../[...nextauth]/route';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nieautoryzowany dostęp" }, 
        { status: 401 }
      );
    }

    // Usuwamy użytkownika z bazy danych
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas usuwania konta:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania konta" },
      { status: 500 }
    );
  }
} 