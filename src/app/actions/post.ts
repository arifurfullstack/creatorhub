"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPost(formData: {
  title: string;
  content: string;
  visibility: string;
  price: number;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to upload content");
  }

  if ((session.user as any).role !== "creator") {
    throw new Error("Only content creators can publish posts");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Creator profile has not been initialized. Please visit the setup page.");
  }

  const post = await prisma.post.create({
    data: {
      creatorProfileId: profile.id,
      title: formData.title.trim(),
      content: formData.content.trim(),
      visibility: formData.visibility,
      price: formData.visibility === "locked" ? Number(formData.price) : 0.0,
      status: "published",
    },
  });

  if (formData.mediaUrl) {
    await prisma.postMedia.create({
      data: {
        postId: post.id,
        type: formData.mediaType || "image",
        url: formData.mediaUrl.trim(),
        fileName: formData.fileName || "creator_upload.jpg",
        fileSize: formData.fileSize || 524000,
      },
    });
  }

  // Increment creator post count
  await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: { postCount: { increment: 1 } },
  });

  revalidatePath(`/creator/${profile.username}`);
  revalidatePath("/feed");

  const fullPost = {
    id: post.id,
    title: post.title,
    content: post.content,
    visibility: post.visibility,
    price: post.price,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt.toISOString(),
    creatorProfile: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      isVerified: profile.isVerified,
      user: {
        image: session.user.image || null,
      },
    },
    media: formData.mediaUrl ? [{
      id: Math.random().toString(),
      type: formData.mediaType || "image",
      url: formData.mediaUrl.trim(),
    }] : [],
  };

  return { success: true, post: fullPost };
}

export async function deletePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to delete content");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Creator profile not found");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.creatorProfileId !== profile.id) {
    throw new Error("You are not authorized to delete this post");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  // Decrement creator post count
  await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: { postCount: { decrement: 1 } },
  });

  revalidatePath(`/creator/${profile.username}`);
  revalidatePath("/feed");

  return { success: true };
}
