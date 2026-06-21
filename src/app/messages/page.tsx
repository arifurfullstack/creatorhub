import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConversations } from "@/app/actions/message";
import MessagesClient from "@/components/chat/messages-client";
import { prisma } from "@/lib/db";

interface PageProps {
  searchParams: Promise<{ chat?: string }>;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const { chat } = await searchParams;
  let activeChatUserId = chat || null;

  // If a chat query userId was requested, check if they exist and create a thread if it doesn't exist
  if (activeChatUserId) {
    const participant = await prisma.user.findUnique({
      where: { id: activeChatUserId },
    });
    if (!participant) {
      activeChatUserId = null;
    }
  }

  // Load conversations
  const conversations = await getConversations();

  // If we had a query user but they aren't in the conversation thread list yet, manually insert them
  if (activeChatUserId && !conversations.some((c) => c.id === activeChatUserId)) {
    const user = await prisma.user.findUnique({
      where: { id: activeChatUserId },
      include: { creatorProfile: true },
    });

    if (user) {
      conversations.unshift({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
        lastMessage: "Start a conversation",
        lastMessageAt: new Date().toISOString(),
        unread: false,
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
      <MessagesClient
        initialConversations={conversations}
        currentUserId={session.user.id}
        chattingWithUserId={activeChatUserId}
      />
    </div>
  );
}
