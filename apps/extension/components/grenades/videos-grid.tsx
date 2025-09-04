import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Video, Side } from "@/types";
import { useI18n } from "../../hooks/use-i18n";

interface VideosGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  scrollAreaRef?: React.RefObject<HTMLDivElement | null>;
}

export function VideosGrid({
  videos,
  onVideoSelect,
  scrollAreaRef,
}: VideosGridProps) {
  const { t } = useI18n();

  const sideFilters = [
    {
      key: "t" as Side,
      icon: "https://media.kage.gg/images/t.png",
    },
    {
      key: "ct" as Side,
      icon: "https://media.kage.gg/images/ct.png",
    },
  ];

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noVideosAvailable")}
      </div>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-[60vh] w-full rounded-md border p-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <Card key={index} className="overflow-hidden p-0">
            <CardContent className="p-0">
              <div
                className="relative cursor-pointer"
                onWheel={(e) => e.stopPropagation()}
                onClick={() => onVideoSelect(video)}
              >
                <img
                  src={video.poster}
                  alt={video.title}
                  className="w-full aspect-video object-cover hover:opacity-80 transition-opacity"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-2">{video.title}</h4>
                <div className="flex gap-2">
                  {video.side && (
                    <Badge variant="outline" className="text-xs">
                      <img
                        src={
                          sideFilters.find((s) => s.key === video.side)?.icon
                        }
                        alt={video.side}
                        className="w-3 h-3 mr-1"
                      />
                      {t(video.side)}
                    </Badge>
                  )}
                  {video.grenadeType && (
                    <Badge variant="outline" className="text-xs">
                      {t(
                        video.grenadeType === "he"
                          ? "heGrenades"
                          : video.grenadeType
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
