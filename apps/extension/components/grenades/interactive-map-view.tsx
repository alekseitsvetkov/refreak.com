import React from "react";
import { InteractiveImage } from "../interactive-image";
import { Video, Pin } from "@/types";

interface InteractiveMapViewProps {
  selectedMap: string;
  mapName?: string;
  mapImage: string;
  videos: Video[];
}

export function InteractiveMapView({
  selectedMap,
  mapName,
  mapImage,
  videos,
}: InteractiveMapViewProps) {
  // Function to generate pins from grenade coordinates
  const generatePinsFromCoordinates = (videos: Video[]): Pin[] => {
    const pinMap = new Map<string, Pin & { amount: number }>();

    videos.forEach((video) => {
      // Add only landing pins for display on the map
      if (video.landing) {
        const landingKey = `${video.landing.x},${video.landing.y}`;
        const existing = pinMap.get(landingKey);
        if (existing) {
          existing.amount += 1;
        } else {
          pinMap.set(landingKey, {
            x: video.landing.x,
            y: video.landing.y,
            amount: 1,
            type: "landing",
          });
        }
      }
    });

    const pins = Array.from(pinMap.values());
    return pins;
  };

  return selectedMap && mapImage ? (
    <InteractiveImage
      src={mapImage}
      alt={mapName || selectedMap}
      resetKey={selectedMap}
      pins={generatePinsFromCoordinates(videos)}
      videos={videos}
    />
  ) : (
    <div className="text-muted-foreground" />
  );
}
