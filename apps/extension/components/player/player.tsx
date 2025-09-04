import "@vidstack/react/player/styles/base.css";

import { useEffect, useRef } from "react";

import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
} from "@vidstack/react";

import { VideoLayout } from "./layouts/video-layout";

export interface PlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  thumbnails?: string;
  className?: string;
  autoPlay?: boolean;
  onProviderChange?: (
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent
  ) => void;
  onCanPlay?: (
    detail: MediaCanPlayDetail,
    nativeEvent: MediaCanPlayEvent
  ) => void;
}

export function Player({
  src,
  poster,
  title,
  thumbnails,
  className,
  autoPlay = false,
  onProviderChange,
  onCanPlay,
}: PlayerProps) {
  let player = useRef<MediaPlayerInstance>(null);

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(({ paused, viewType }) => {});
  }, []);

  function handleProviderChange(
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
    onProviderChange?.(provider, nativeEvent);
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function handleCanPlay(
    detail: MediaCanPlayDetail,
    nativeEvent: MediaCanPlayEvent
  ) {
    onCanPlay?.(detail, nativeEvent);
  }

  return (
    <MediaPlayer
      className={`${className} w-full h-full media-player`}
      title={title}
      src={src}
      crossOrigin
      playsInline
      autoPlay={autoPlay}
      onProviderChange={handleProviderChange}
      onCanPlay={handleCanPlay}
      ref={player}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <MediaProvider
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <Poster
          className="absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
          src={poster}
          alt={title}
        />
        <style>{`
          .media-player video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
        `}</style>
      </MediaProvider>

      <VideoLayout thumbnails={thumbnails} />
    </MediaPlayer>
  );
}
