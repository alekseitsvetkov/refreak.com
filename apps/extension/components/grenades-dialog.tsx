import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "../hooks/use-i18n";
import refreakIcon from "@/assets/icons/refreak.svg";
import {
  Video,
  GameMap,
  GrenadesDialogProps,
  Side,
  GrenadeType,
  ViewType,
} from "@/types";
import de_ancient from "@/assets/images/maps/de_ancient.png";
import de_dust2 from "@/assets/images/maps/de_dust2.png";
import de_mirage from "@/assets/images/maps/de_mirage.png";
import de_inferno from "@/assets/images/maps/de_inferno.png";
import de_nuke from "@/assets/images/maps/de_nuke.png";
import de_overpass from "@/assets/images/maps/de_overpass.png";
import de_train from "@/assets/images/maps/de_train.png";
import de_vertigo from "@/assets/images/maps/de_vertigo.png";
import de_anubis from "@/assets/images/maps/de_anubis.png";
import {
  MapsGrid,
  MapFilters,
  VideosGrid,
  VideoPlayer,
  InteractiveMapView,
} from "./grenades";

export function GrenadesDialog({ container }: GrenadesDialogProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [sideFilter, setSideFilter] = useState<Side | "any">("any");
  const [grenadeTypeFilter, setGrenadeTypeFilter] = useState<
    GrenadeType | "any"
  >("smokes");
  const [viewFilter, setViewFilter] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const MAP_IMAGES: Record<string, string> = {
    ancient: de_ancient,
    dust2: de_dust2,
    mirage: de_mirage,
    inferno: de_inferno,
    nuke: de_nuke,
    overpass: de_overpass,
    train: de_train,
    vertigo: de_vertigo,
    anubis: de_anubis,
  };

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch(
          "https://media.kage.gg/images/grenades.json"
        );
        const data = await response.json();
        setMaps(data);
      } catch (error) {
        console.error("Failed to fetch maps:", error);
        // Fallback to empty array if API fails
        setMaps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  const handleBack = () => {
    stopAllVideos();
    setSelectedMap(null);
    setSideFilter("any");
    setGrenadeTypeFilter("smokes");
    setSearchQuery("");
    setSelectedVideo(null);
    forceVideoRerender();
  };

  const stopAllVideos = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  };

  const forceVideoRerender = () => {
    setVideoKey((prev) => prev + 1);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToGrid = () => {
    setSelectedVideo(null);
  };

  const currentMap = selectedMap
    ? maps.find((m) => m.key === selectedMap)
    : null;

  const filteredVideos = currentMap
    ? currentMap.videos.filter(
        (video) =>
          (sideFilter === "any" || !video.side || video.side === sideFilter) &&
          (grenadeTypeFilter === "any" ||
            !video.grenadeType ||
            video.grenadeType === grenadeTypeFilter) &&
          (searchQuery === "" ||
            video.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const hasInteractiveMapData = filteredVideos.some(
    (video) => video.landing && video.throwing
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          stopAllVideos();
          forceVideoRerender();
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="w-full bg-[#f1f1f1]/[0.08] hover:bg-[#f1f1f1]/[0.10] text-[#a7a7a7] justify-start border-none hover:cursor-pointer h-10 font-normal text-base shine-container p-[1px]"
        >
          <span className="shine-stripe" />
          <span className="shine-inner bg-[#242424] hover:bg-[#242424] px-3 gap-3">
            <img src={refreakIcon} alt="refreak" className="size-4" />
            <span>{t("grenades")}</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        container={container}
        className="flex flex-col min-w-[60vw] p-0"
      >
        <DialogTitle className="pt-6 px-6 pb-2">
          {selectedMap ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="hover:cursor-pointer"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" /> {t("maps")}
              </Button>
              <div className="text-center text-2xl font-bold flex-1">
                {currentMap?.name}
              </div>
              <div className="w-[88px]"></div>
            </div>
          ) : (
            t("grenades")
          )}
        </DialogTitle>

        <Separator />

        {!selectedMap ? (
          <MapsGrid
            maps={maps}
            isLoading={isLoading}
            onMapSelect={setSelectedMap}
          />
        ) : (
          <div className="px-6 pb-6 pt-2 flex flex-row gap-4">
            <MapFilters
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                stopAllVideos();
                setSearchQuery(query);
                forceVideoRerender();
              }}
              viewFilter={viewFilter}
              onViewFilterChange={(view) => {
                stopAllVideos();
                setViewFilter(view);
                forceVideoRerender();
              }}
              sideFilter={sideFilter}
              onSideFilterChange={(side) => {
                stopAllVideos();
                setSideFilter(side);
                forceVideoRerender();
              }}
              grenadeTypeFilter={grenadeTypeFilter}
              onGrenadeTypeFilterChange={(type) => {
                stopAllVideos();
                setGrenadeTypeFilter(type);
                forceVideoRerender();
              }}
              hasInteractiveMapData={hasInteractiveMapData}
            />

            {viewFilter === "interactive_map" ? (
              <InteractiveMapView
                selectedMap={selectedMap}
                mapName={currentMap?.name}
                mapImage={MAP_IMAGES[selectedMap]}
                videos={filteredVideos}
              />
            ) : selectedVideo ? (
              <VideoPlayer
                video={selectedVideo}
                onBackToGrid={handleBackToGrid}
              />
            ) : (
              <VideosGrid
                videos={filteredVideos}
                onVideoSelect={handleVideoSelect}
                scrollAreaRef={scrollAreaRef}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
