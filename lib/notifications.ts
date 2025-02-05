import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string;
  actionUrl?: string;
};

export async function createNotification(input: NotificationInput) {
  return await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      targetId: input.targetId,
      actionUrl: input.actionUrl,
    },
  });
}

// Funkcje pomocnicze do generowania URL-i
export function getTeamUrl(teamId: string) {
  return `/team?openTeam=${teamId}`;
}

export function getProjectUrl(projectId: string) {
  return `/project/${projectId}`;
}

export function getTaskUrl(projectId: string, taskId: string, tab?: string) {
  const baseUrl = `/project/${projectId}?editTask=${taskId}`;
  return tab ? `${baseUrl}&tab=${tab}` : baseUrl;
} 