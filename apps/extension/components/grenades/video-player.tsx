import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Video, Side } from "@/types";
import { Player } from "../player/player";
import { useI18n } from "../../hooks/use-i18n";

interface VideoPlayerProps {
  video?: Video;
  videos?: Video[];
  onBackToGrid: () => void;
  backText?: string;
}

export function VideoPlayer({
  video,
  videos,
  onBackToGrid,
  backText,
}: VideoPlayerProps) {
  const { t } = useI18n();

  // Если передан массив видео, используем его как плейлист
  const isPlaylist = videos && videos.length > 1;
  const videoList = isPlaylist ? videos : video ? [video] : [];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentVideo = videoList[currentVideoIndex];

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

  const handlePreviousVideo = () => {
    if (isPlaylist && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (isPlaylist && currentVideoIndex < videoList.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  if (!currentVideo) {
    return null;
  }

  return (
    <Card className="overflow-hidden p-0 w-full rounded-md">
      <CardContent className="p-0 w-full relative flex flex-col min-h-[500px]">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToGrid}
          className="absolute top-2 left-2 z-10 hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {backText || t("list")}
        </Button>

        {/* Основное видео */}
        <div className="flex-1 bg-background w-full relative">
          <Player
            title={currentVideo.title}
            src={currentVideo.sources?.[0]?.src}
            poster={currentVideo.poster}
            autoPlay
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Информация о текущем видео */}
        <div className="p-4 border-t border-neutral-700">
          <h4 className="font-medium mb-2 text-white">{currentVideo.title}</h4>
          <div className="flex gap-2">
            {currentVideo.side && (
              <Badge variant="outline" className="text-xs">
                <img
                  src={
                    sideFilters.find((s) => s.key === currentVideo.side)?.icon
                  }
                  alt={currentVideo.side}
                  className="w-3 h-3 mr-1"
                />
                {t(currentVideo.side)}
              </Badge>
            )}
            {currentVideo.grenadeType && (
              <Badge variant="outline" className="text-xs">
                {t(
                  currentVideo.grenadeType === "he"
                    ? "heGrenades"
                    : currentVideo.grenadeType
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Горизонтальный плейлист (только для плейлистов) */}
        {isPlaylist && (
          <div className="border-t border-neutral-700 bg-neutral-900">
            {/* <div className="p-4 border-b border-neutral-700">
              <h3 className="font-semibold text-white text-lg">Плейлист</h3>
              <p className="text-neutral-400 text-sm">
                {videoList.length} видео
              </p>
            </div> */}
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {videoList.map((video, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-48 rounded-md overflow-hidden cursor-pointer transition-all duration-200 hover:bg-neutral-800 ${
                      index === currentVideoIndex
                        ? "bg-neutral-800 ring-1 ring-neutral-700"
                        : "bg-neutral-800"
                    }`}
                    onClick={() => handleVideoSelect(index)}
                  >
                    {/* Превью видео */}
                    <div className="relative w-full h-28">
                      {video.poster ? (
                        <img
                          src={video.poster}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                          <Play className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      {/* Индикатор текущего видео */}
                      {index === currentVideoIndex && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                      )}
                      {/* Номер видео */}
                      <div className="absolute top-2 left-2 bg-neutral-800 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>

                    {/* Информация о видео */}
                    <div className="p-3">
                      <h4 className="font-medium text-white text-sm line-clamp-2 mb-2">
                        {video.title}
                      </h4>
                      {/* <div className="flex gap-1 flex-wrap">
                        {video.side && (
                          <Badge variant="outline" className="text-xs h-5">
                            <img
                              src={
                                sideFilters.find((s) => s.key === video.side)
                                  ?.icon
                              }
                              alt={video.side}
                              className="w-2.5 h-2.5 mr-1"
                            />
                            {t(video.side)}
                          </Badge>
                        )}
                        {video.grenadeType && (
                          <Badge variant="outline" className="text-xs h-5">
                            {t(
                              video.grenadeType === "he"
                                ? "heGrenades"
                                : video.grenadeType
                            )}
                          </Badge>
                        )}
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
