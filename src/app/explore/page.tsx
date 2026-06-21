import { prisma } from "@/lib/db";
import ExploreClient from "@/components/creator/explore-client";

export default async function ExplorePage() {
  // Query all creators
  const creators = await prisma.creatorProfile.findMany({
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
    },
    orderBy: {
      followerCount: "desc",
    },
  });

  // Query all categories
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Serialize dates to prevent SSR hydration serialization warnings
  const serializedCreators = creators.map((creator) => ({
    id: creator.id,
    username: creator.username,
    displayName: creator.displayName,
    bio: creator.bio || "",
    location: creator.location || "",
    coverImage: creator.coverImage || "",
    isVerified: creator.isVerified,
    followerCount: creator.followerCount,
    subscriberCount: creator.subscriberCount,
    postCount: creator.postCount,
    user: {
      image: creator.user.image,
    },
    plans: creator.plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
    })),
  }));

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return (
    <div className="min-h-screen bg-[#09090b]">
      <ExploreClient creators={serializedCreators} categories={serializedCategories} />
    </div>
  );
}
