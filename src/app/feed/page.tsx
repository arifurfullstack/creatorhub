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

  // Query top 3 recommended creators
  const recommended = await prisma.creatorProfile.findMany({
    take: 3,
    include: {
      user: {
        select: {
          image: true,
        },
      },
    },
    orderBy: {
      followerCount: "desc",
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

  const serializedRecommended = recommended.map((creator) => ({
    id: creator.id,
    username: creator.username,
    displayName: creator.displayName,
    isVerified: creator.isVerified,
    bio: creator.bio || "",
    user: {
      image: creator.user.image,
    },
  }));

  // Query followed creator IDs if logged in
  let followedCreatorIds: string[] = [];
  if (session?.user) {
    const follows = await prisma.follow.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        creatorProfileId: true,
      },
    });
    followedCreatorIds = follows.map((f) => f.creatorProfileId);
  }

  return (
    <div className="min-h-screen bg-transparent">
      <FeedClient
        initialPosts={serializedPosts}
        sessionUser={session?.user || null}
        recommendedCreators={serializedRecommended}
        initialFollowedCreatorIds={followedCreatorIds}
      />
    </div>
  );
}
