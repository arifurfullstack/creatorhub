import { prisma } from "../src/lib/db";
import { auth } from "../src/lib/auth";

async function main() {
  console.log("Seeding database and credentials...");

  // 1. Clean existing data
  await prisma.systemSetting.deleteMany({});
  await prisma.postMedia.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.creatorProfile.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "commission_rate", value: "10", description: "Platform commission rate percentage" },
      { key: "min_withdrawal_amount", value: "50", description: "Minimum payout request in USD" },
    ],
  });

  // 3. Create Admin & Credentials
  console.log("Creating Admin credentials...");
  const adminRes = await auth.api.signUpEmail({
    body: {
      email: "admin@creatorhub.com",
      password: "adminpassword123",
      name: "Global Admin",
      role: "admin",
    } as any,
    headers: new Headers(),
  });
  
  if (!adminRes) {
    throw new Error("Failed to create admin user");
  }

  // 4. Create Fan Test User & Credentials
  console.log("Creating Fan credentials...");
  const fanRes = await auth.api.signUpEmail({
    body: {
      email: "fan@creatorhub.com",
      password: "fanpassword123",
      name: "Alice Fan",
      role: "fan",
    } as any,
    headers: new Headers(),
  });

  if (!fanRes) {
    throw new Error("Failed to create fan user");
  }

  // 5. Create Creators & Profiles
  const creatorsData = [
    {
      email: "aria@creatorhub.com",
      name: "Aria Vance",
      username: "ariavance",
      category: "Digital Art & 3D",
      bio: "Digital artist creating 3D environments, custom shader assets, and UI tutorials. Subscribe for source files.",
      location: "New York, NY",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      plans: [
        { name: "Basic Art Lover", price: 5, benefits: ["Access to all work-in-progress posts", "Subscribers-only chat rooms", "Weekly wallpapers"] },
        { name: "Premium Creator", price: 15, benefits: ["Download high-res source files (.blend / .obj)", "Monthly live Q&A sessions", "Detailed shader tutorials", "Direct message priority"] },
        { name: "VIP Backstage", price: 50, benefits: ["1-on-1 portfolio review", "Custom shader requests", "All premium resources included", "Direct messaging"] },
      ],
      posts: [
        { title: "WIP: Neon City Alleyway Render", content: "Working on a new Cyberpunk scene using Blender. Experimenting with volumetric neon emissions and wet asphalt textures. Check out the viewport screenshot below!", visibility: "public", price: 0, media: ["https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&q=80&w=800"] },
        { title: "Shader Breakdown: Hologram Material", content: "Here is the nodes setup for my latest holographic shield shader. Make sure your mix shader uses Fresnel and noise inputs for the scanline flickers.", visibility: "followers", price: 0, media: ["https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800"] },
        { title: "[Premium] Neon City Source .blend File", content: "Download the complete Blender project file with custom lighting nodes, materials, and volumetric setup. Compatible with Blender 4.0 and Eevee/Cycles engines.", visibility: "subscribers", price: 0, media: ["https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800"] },
        { title: "Exclusive Cyberpunk Vehicle Base Mesh", content: "Get instant access to this high-quality hard surface model. Clean quad topology, UV unwrapped, and ready for texturing in Substance Painter.", visibility: "locked", price: 10, media: ["https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800"] },
      ],
    },
    {
      email: "marcus@creatorhub.com",
      name: "Marcus Cole",
      username: "marcusmusic",
      category: "Music & Beats",
      bio: "Electronic music producer releasing custom synthwave beats, drum kits, and Ableton project templates.",
      location: "Los Angeles, CA",
      coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      plans: [
        { name: "Beat Listener", price: 8, benefits: ["Listen to new releases 48h early", "High-fidelity audio stream", "Subscribers-only updates"] },
        { name: "Producer Pack", price: 20, benefits: ["Download royalty-free drum loops & samples", "Ableton project templates", "Stems access for remixing"] },
      ],
      posts: [
        { title: "Teaser: Sunset Drive Synthwave Beat", content: "Testing a new hardware synthesizer (Korg Prologue). Let me know what you think about this bassline!", visibility: "public", price: 0, media: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"] },
        { title: "Ableton Project Template - Sunset Drive", content: "Ableton Live 11 Suite project template. Uses Serum for the main chords and sub-bass. All MIDI tracks frozen and bounced.", visibility: "subscribers", price: 0, media: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800"] },
      ],
    },
    {
      email: "elena@creatorhub.com",
      name: "Elena Rostova",
      username: "elenafit",
      category: "Fitness & Nutrition",
      bio: "Personal trainer and nutritionist sharing customized home workout videos and healthy meal prep schedules.",
      location: "Miami, FL",
      coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      plans: [
        { name: "Workout Warrior", price: 12, benefits: ["Full access to 40+ workout videos", "Weekly fitness planner", "Community weight tracker"] },
        { name: "Elite Coaching", price: 40, benefits: ["Monthly tailored meal plans", "Direct chat response in 24 hours", "Custom macro calculator", "Bi-weekly video consultations"] },
      ],
      posts: [
        { title: "5-Minute Full Body Warmup Routine", content: "Dynamic stretches to activate glutes, open hip flexors, and prepare shoulders for lifting. Do this before every session!", visibility: "public", price: 0, media: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800"] },
        { title: "Weekly Meal Prep Matrix (PDF)", content: "High-protein meal plan containing recipes, shopping lists, and dynamic caloric calculators for weight loss and muscle retention.", visibility: "subscribers", price: 0, media: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"] },
      ],
    },
    {
      email: "sarah@creatorhub.com",
      name: "Sarah Chen",
      username: "sarahux",
      category: "UI/UX & Product Design",
      bio: "Principal UX Designer & Design Systems Architect. Creating premium glassmorphism layouts, Figma token kits, and interactive micro-interactions. Subscribe to download my design systems & source files.",
      location: "San Francisco, CA",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      isVerified: true,
      socialLinks: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        dribbble: "https://dribbble.com",
        behance: "https://behance.com",
        skills: [
          { name: "Design Systems & Component Architecture", level: 95, category: "Core Design" },
          { name: "Figma Variables & Tokens", level: 90, category: "Core Design" },
          { name: "Interactive Prototyping & Motion", level: 85, category: "Core Design" },
          { name: "Spatial UI Design (visionOS)", level: 80, category: "Specialized" },
          { name: "Responsive Layouts (Web/Mobile)", level: 95, category: "Core Design" },
          { name: "UX Research & Wireframing", level: 90, category: "Core Design" },
          { name: "HTML/CSS, Tailwind & React", level: 80, category: "Development" }
        ],
        projects: [
          {
            title: "Aethera SaaS Design System",
            description: "A comprehensive UI kit for enterprise dashboards featuring light/dark variables, fluid typography, and 150+ interactive variants.",
            role: "Lead Product Designer",
            skills: ["Figma Variables", "Component Architecture", "Design Tokens"],
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
            demoUrl: "https://figma.com",
            githubUrl: "https://github.com"
          },
          {
            title: "Nova Fintech Mobile App UI/UX",
            description: "End-to-end design for a digital banking app focused on micro-investing. Included high-fidelity interactive flow animation in Principle.",
            role: "Lead UX/UI Designer",
            skills: ["Mobile UX", "Interactive Prototyping", "User Testing"],
            image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800",
            demoUrl: "https://figma.com"
          },
          {
            title: "Spatial Glassmorphism visionOS Concept",
            description: "An immersive UI prototype exploring glass shaders, volumetric cards, and hover glow feedback loops for spatial computing.",
            role: "Concept Artist & Spatial Designer",
            skills: ["visionOS", "3D Rendering", "Apple Design Guidelines"],
            image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
            demoUrl: "https://figma.com"
          }
        ]
      },
      plans: [
        { name: "Design Apprentice", price: 10, benefits: ["Access to Figma design templates", "UX case studies breakdown", "Access to subscriber chat room"] },
        { name: "Design System Pro", price: 25, benefits: ["Download full design system file (Figma + Tokens)", "Monthly masterclass video on motion design", "Framer/Next.js UI components template", "Priority DM replies"] },
        { name: "VIP Studio Mentorship", price: 75, benefits: ["1-on-1 portfolio review & advice", "Custom component design requests", "All premium resources & source files"] },
      ],
      posts: [
        { title: "SaaS Dashboard Wireframe System", content: "Check out the wireframe layout kit for modern SaaS applications. Focus on clean grid alignment, clear typographic hierarchy, and quick navigation layouts before adding high-fidelity skins.", visibility: "public", price: 0, media: ["https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=800"] },
        { title: "[Download] Glassmorphic Component Library", content: "A high-fidelity Figma asset bundle exploring glassmorphic panels, glowing neon highlights, and custom backdrop blur settings. Premium download for subscribers.", visibility: "subscribers", price: 0, media: ["https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800"] },
      ],
    },
  ];

  for (const c of creatorsData) {
    console.log(`Creating Creator credentials for ${c.name}...`);
    const creatorRes = await auth.api.signUpEmail({
      body: {
        email: c.email,
        password: "creatorpassword123",
        name: c.name,
        image: c.avatar,
        role: "creator",
      } as any,
      headers: new Headers(),
    });

    if (!creatorRes) {
      throw new Error(`Failed to create creator user ${c.name}`);
    }

    const creatorUser = creatorRes.user;

    const profile = await prisma.creatorProfile.create({
      data: {
        userId: creatorUser.id,
        username: c.username,
        displayName: c.name,
        bio: c.bio,
        location: c.location,
        coverImage: c.coverImage,
        isVerified: c.isVerified,
        socialLinks: (c as any).socialLinks ? JSON.stringify((c as any).socialLinks) : null,
        followerCount: Math.floor(Math.random() * 500) + 100,
        subscriberCount: Math.floor(Math.random() * 50) + 10,
        postCount: c.posts.length,
      },
    });

    // Create plans
    for (const plan of c.plans) {
      await prisma.membershipPlan.create({
        data: {
          creatorProfileId: profile.id,
          name: plan.name,
          price: plan.price,
          benefits: plan.benefits,
        },
      });
    }

    // Create posts
    for (const post of c.posts) {
      const createdPost = await prisma.post.create({
        data: {
          creatorProfileId: profile.id,
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          price: post.price,
          likesCount: Math.floor(Math.random() * 45) + 5,
          commentsCount: Math.floor(Math.random() * 12) + 1,
        },
      });

      for (const mUrl of post.media) {
        await prisma.postMedia.create({
          data: {
            postId: createdPost.id,
            type: "image",
            url: mUrl,
            fileName: "mock_image.jpg",
            fileSize: 452000,
          },
        });
      }
    }
  }

  console.log("=========================================");
  console.log("SEED COMPLETE!");
  console.log("Use the following credentials to log in:");
  console.log("-----------------------------------------");
  console.log("1. ADMIN Account:");
  console.log("   - Email:    admin@creatorhub.com");
  console.log("   - Password: adminpassword123");
  console.log("-----------------------------------------");
  console.log("2. FAN Account:");
  console.log("   - Email:    fan@creatorhub.com");
  console.log("   - Password: fanpassword123");
  console.log("-----------------------------------------");
  console.log("3. CREATOR Account (Aria Vance):");
  console.log("   - Email:    aria@creatorhub.com");
  console.log("   - Password: creatorpassword123");
  console.log("-----------------------------------------");
  console.log("4. CREATOR Account (Sarah Chen - UI/UX Design):");
  console.log("   - Email:    sarah@creatorhub.com");
  console.log("   - Password: creatorpassword123");
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
