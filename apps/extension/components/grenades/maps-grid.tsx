import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { GameMap } from "@/types";
import { MAP_POSTERS } from "@/constants";
import { useI18n } from "../../hooks/use-i18n";

interface MapsGridProps {
  maps: GameMap[];
  isLoading: boolean;
  onMapSelect: (mapKey: string) => void;
}

export function MapsGrid({ maps, isLoading, onMapSelect }: MapsGridProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="col-span-full text-center py-8 text-muted-foreground">
        {t("loadingMaps")}
      </div>
    );
  }

  if (maps.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-muted-foreground">
        {t("noMapsAvailable")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 pb-6 pt-2">
      {maps.map((map) => {
        const posterUrl = MAP_POSTERS[map.key];
        const hasVideos = map.videos.length > 0;

        return (
          <Card
            key={map.key}
            className={`group relative overflow-hidden border-none rounded-lg transition-all duration-300 aspect-square ${
              hasVideos
                ? "cursor-pointer hover:shadow-lg"
                : "cursor-not-allowed"
            }`}
            onClick={() => hasVideos && onMapSelect(map.key)}
            style={{
              backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {hasVideos && (
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-orange-500 transition-colors duration-300 z-20 pointer-events-none" />
            )}
            <div
              className={`absolute top-0 left-0 h-full w-full inset-0 transition-colors duration-300 ${
                hasVideos
                  ? "bg-black/60 group-hover:bg-black/50"
                  : "bg-black/85"
              }`}
            />
            <CardContent className="relative z-10 p-4 text-center items-center justify-center h-full flex flex-col">
              <img
                src={map.icon}
                alt={map.name}
                className="w-16 h-16 mx-auto mb-3"
              />
              <h3 className="font-bold text-lg mb-1 text-white drop-shadow-lg">
                {map.name}
              </h3>
              {hasVideos ? (
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm pb-1 mt-2"
                >
                  {map.videos.length}{" "}
                  {map.videos.length === 1 ? t("video") : t("videos")}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/10 text-white border-white/20 backdrop-blur-sm pb-1 mt-2"
                >
                  {t("soon")}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
