import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileClient from "@/components/creator/profile-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const creator = await prisma.creatorProfile.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      user: {
        select: {
          image: true,
        },
      },
      plans: {
        orderBy: {
          price: "asc",
        },
      },
      posts: {
        where: {
          status: "published",
        },
        include: {
          media: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!creator) {
    notFound();
  }

  let isFollowing = false;
  if (session?.user) {
    const follow = await prisma.follow.findUnique({
      where: {
        userId_creatorProfileId: {
          userId: session.user.id,
          creatorProfileId: creator.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  // Serialize Prisma Date objects to strings for Client Component usage
  const serializedCreator = {
    id: creator.id,
    userId: creator.userId,
    username: creator.username,
    displayName: creator.displayName,
    bio: creator.bio,
    location: creator.location,
    coverImage: creator.coverImage,
    socialLinks: creator.socialLinks,
    followerCount: creator.followerCount,
    subscriberCount: creator.subscriberCount,
    postCount: creator.postCount,
    isVerified: creator.isVerified,
    createdAt: creator.createdAt.toISOString() as any,
    updatedAt: creator.updatedAt.toISOString() as any,
    user: {
      image: creator.user.image,
    },
    plans: creator.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      description: plan.description,
      benefits: plan.benefits,
    })),
    posts: creator.posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      visibility: post.visibility,
      price: post.price,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt.toISOString() as any,
      media: post.media.map((med) => ({
        id: med.id,
        type: med.type,
        url: med.url,
        previewUrl: med.previewUrl,
      })),
    })),
  };

  return <ProfileClient creator={serializedCreator} initialIsFollowing={isFollowing} />;
}
