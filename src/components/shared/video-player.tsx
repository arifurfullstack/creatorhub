"use client";

import dynamic from "next/dynamic";
import "plyr/dist/plyr.css";

// Dynamically import Plyr with SSR disabled to prevent hydration mismatch errors
const Plyr = dynamic<any>(() => import("plyr-react").then((m: any) => m.default), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoType = src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";

  const videoSource = {
    type: "video" as const,
    sources: [
      {
        src: src,
        type: videoType,
      },
    ],
    poster: poster,
  };

  // Plyr options for premium and clean styling
  const plyrOptions = {
    controls: [
      "play-large",
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "captions",
      "settings",
      "pip",
      "airplay",
      "fullscreen",
    ],
    settings: ["quality", "speed"],
    tooltips: { controls: true, seek: true },
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#121214] w-full relative group">
      <Plyr source={videoSource} options={plyrOptions} />
    </div>
  );
}
