import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID powiadomienia" },
        { status: 400 }
      );
    }

    console.log("Aktualizacja powiadomienia:", {
      id: notificationId,
      userId: session.user.id
    });

    const data = await request.json();
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        isRead: data.isRead,
      },
    });

    console.log("Zaktualizowane powiadomienie:", notification);

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Błąd podczas aktualizacji powiadomienia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji powiadomienia" },
      { status: 500 }
    );
  }
} 