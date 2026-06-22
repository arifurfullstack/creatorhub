"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

interface PlyrInstance {
  source: {
    type: "video";
    sources: Array<{
      src: string;
      type: string;
    }>;
    poster?: string;
  };
  destroy(): void;
}

type PlyrConstructor = new (element: HTMLVideoElement, options?: unknown) => PlyrInstance;

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlyrInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let player: PlyrInstance | null = null;

    // Load Plyr dynamically on the client side to avoid SSR/window issues
    import("plyr").then((module) => {
      if (!videoRef.current) return;
      
      try {
        const PlyrClass = module.default as unknown as PlyrConstructor;
        if (!PlyrClass) {
          throw new Error("Plyr default export is undefined");
        }

        player = new PlyrClass(videoRef.current, {
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
        });
        playerRef.current = player;

        const videoType = src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
        player.source = {
          type: "video",
          sources: [
            {
              src: src,
              type: videoType,
            },
          ],
          poster: poster,
        };
      } catch (initErr: unknown) {
        console.error("Error initializing Plyr class:", initErr);
        const errMessage = initErr instanceof Error ? initErr.message : String(initErr);
        setError(`Init Error: ${errMessage}`);
      }
    }).catch((err) => {
      console.error("Failed to load Plyr chunk:", err);
      const errMessage = err instanceof Error ? err.message : String(err);
      setError(`Load Error: ${errMessage}`);
    });

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [src, poster]);

  return (
    <div 
      className="rounded-2xl overflow-hidden border border-white/5 bg-[#121214] w-full relative group"
      style={{
        // Override Plyr accent color to match CreatorHub's primary branding color
        "--plyr-color-main": "var(--primary, #FF4FA3)",
        "--plyr-range-fill-background": "var(--primary, #FF4FA3)",
        "--plyr-control-radius": "8px",
      } as React.CSSProperties}
    >
      {error && (
        <div className="absolute top-2 left-2 z-50 p-2 text-xs text-red-500 bg-black/80 border border-red-500/20 rounded">
          {error}
        </div>
      )}
      <video key={src} ref={videoRef} className="plyr-react plyr" playsInline />
    </div>
  );
}

