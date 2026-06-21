import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import FeedClient from "@/components/feed/feed-client";

export default async function FeedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Query posts with status published and load associations
  const posts = await prisma.post.findMany({
    where: {
      status: "published",
    },
    include: {
      creatorProfile: {
        include: {
          user: {
            select: {
              image: true,
            },
          },
        },
      },
      media: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize models to plain JSON-compatible objects
  const serializedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    visibility: post.visibility,
    price: post.price,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt.toISOString(),
    creatorProfile: {
      id: post.creatorProfile.id,
      username: post.creatorProfile.username,
      displayName: post.creatorProfile.displayName,
      isVerified: post.creatorProfile.isVerified,
      user: {
        image: post.creatorProfile.user.image,
      },
    },
    media: post.media.map((med) => ({
      id: med.id,
      type: med.type,
      url: med.url,
    })),
  }));

  return (
    <div className="min-h-screen bg-[#09090b]">
      <FeedClient initialPosts={serializedPosts} sessionUser={session?.user || null} />
    </div>
  );
}
