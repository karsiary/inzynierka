import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Pobieranie powiadomień dla użytkownika:", session.user.id);

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("Znalezione powiadomienia:", notifications);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Błąd podczas pobierania powiadomień:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania powiadomień" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        targetId: data.targetId,
        actionUrl: data.actionUrl,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Błąd podczas tworzenia powiadomienia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia powiadomienia" },
      { status: 500 }
    );
  }
} 