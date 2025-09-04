import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pin, Video } from "@/types";
import { VideoPlayer } from "./grenades/video-player";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// Компонент для стабильного video tooltip
const VideoTooltip = React.memo(
  ({
    video,
    index,
    onClick,
  }: {
    video: Video;
    index: number;
    onClick: (video: Video) => void;
  }) => {
    return (
      <div
        className="w-[384px] max-w-[calc(95vw-(16px*2))] bg-neutral-800/95 rounded-md p-2 shadow-lg cursor-pointer"
        onClick={() => onClick(video)}
      >
        <div className="mb-1.5 flex flex-wrap justify-between">
          <p className="text-sm text-white">Click for full video</p>
          {/* <p className="text-sm text-white">Hold Shift to see lineup</p> */}
        </div>
        <div className="relative h-0 w-full overflow-hidden bg-neutral-700 pb-[56.25%] rounded">
          {video.sources && video.sources.length > 0 ? (
            <>
              <video
                key={`video-${video.title}-${index}`}
                autoPlay
                loop
                disableRemotePlayback
                playsInline
                muted
                poster={video.poster}
                className="absolute inset-0 w-full h-full object-cover"
              >
                {video.sources.map((source, sourceIndex) => (
                  <source
                    key={sourceIndex}
                    src={source.src}
                    type={source.type}
                  />
                ))}
              </video>
            </>
          ) : video.poster ? (
            <img
              src={video.poster}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-neutral-600 flex items-center justify-center">
              <span className="text-white text-sm">No video available</span>
            </div>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap justify-between">
          <p className="text-sm text-white">{video.title || "Title"}</p>
          <p className="text-sm text-white">
            {video.side?.toUpperCase() || "Side"}{" "}
            {video.grenadeType || "Grenade type"}
          </p>
        </div>
      </div>
    );
  }
);

VideoTooltip.displayName = "VideoTooltip";

// Функция для определения оптимальной стороны отображения тултипа
const getOptimalTooltipSide = (
  pinX: number,
  pinY: number,
  containerWidth: number,
  containerHeight: number
) => {
  const tooltipWidth = 320; // Ширина тултипа (обновлена)
  const tooltipHeight = 250; // Примерная высота тултипа (уменьшена)
  const offset = 10;

  // Проверяем, есть ли место справа
  if (pinX + tooltipWidth + offset < containerWidth) {
    return "right";
  }

  // Проверяем, есть ли место слева
  if (pinX - tooltipWidth - offset > 0) {
    return "left";
  }

  // Проверяем, есть ли место снизу
  if (pinY + tooltipHeight + offset < containerHeight) {
    return "bottom";
  }

  // По умолчанию показываем сверху
  return "top";
};

interface InteractiveImageProps {
  src: string;
  alt: string;
  resetKey?: string | number;
  pins?: Pin[];
  videos?: Video[];
}

export function InteractiveImage({
  src,
  alt,
  resetKey,
  pins = [],
  videos = [],
}: InteractiveImageProps) {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [throwingPins, setThrowingPins] = useState<Pin[]>([]);

  const [hoveredLandingPin, setHoveredLandingPin] = useState<number | null>(
    null
  );
  const [hoveredThrowingPin, setHoveredThrowingPin] = useState<number | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Video[] | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const translateStartRef = React.useRef({ x: 0, y: 0 });
  const minScaleRef = React.useRef(1);
  const initialTranslateRef = React.useRef({ x: 0, y: 0 });

  // Функция для получения цвета в зависимости от стороны
  const getSideColor = (side: "t" | "ct", isThrowing = false) => {
    if (side === "t") {
      return {
        bg: isThrowing ? "bg-green-custom" : "bg-orange-dark-custom",
        border: isThrowing
          ? "border-green-custom"
          : "border-orange-custom-text",
      };
    } else {
      return {
        bg: isThrowing ? "bg-green-custom" : "bg-orange-dark-custom",
        border: isThrowing
          ? "border-green-custom"
          : "border-orange-custom-text",
      };
    }
  };

  // Функция для получения стороны пина на основе связанных видео
  const getPinSide = (pin: Pin): "t" | "ct" => {
    const relatedVideos = videos.filter(
      (video) =>
        video.landing && video.landing.x === pin.x && video.landing.y === pin.y
    );

    // Возвращаем сторону первого найденного видео, или "t" по умолчанию
    const side = relatedVideos[0]?.side || "t";
    return side;
  };

  const fitToViewport = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    setImageLoaded(true);
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight)
      return;
    const fittedScale = Math.min(
      containerWidth / naturalWidth,
      containerHeight / naturalHeight
    );
    const fittedTranslateX = (containerWidth - naturalWidth * fittedScale) / 2;
    const fittedTranslateY =
      (containerHeight - naturalHeight * fittedScale) / 2;
    minScaleRef.current = fittedScale;
    initialTranslateRef.current = {
      x: fittedTranslateX,
      y: fittedTranslateY,
    };
    setScale(fittedScale);
    setTranslate({ x: fittedTranslateX, y: fittedTranslateY });
  }, []);

  useEffect(() => {
    // Reset to fitted view when the key (map) changes
    fitToViewport();
    // Clear pin states when map changes
    setSelectedPin(null);
    setThrowingPins([]);
    setSelectedVideo(null);
    setSelectedVideos(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, src, videos]);

  // Дополнительная проверка: если выбранный пин больше не существует, сбрасываем состояние
  useEffect(() => {
    if (selectedPin !== null && selectedPin >= pins.length) {
      setSelectedPin(null);
      setThrowingPins([]);
    }
  }, [selectedPin, pins.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => fitToViewport());
    ro.observe(container);
    return () => ro.disconnect();
  }, [fitToViewport]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const minScale = minScaleRef.current || 0.5;
    const maxScale = 5;
    const scaleDelta = -e.deltaY * 0.0015;
    const newScale = clamp(scale * (1 + scaleDelta), minScale, maxScale);
    const scaleRatio = newScale / scale;

    const offsetX = (cursorX - translate.x) / scale;
    const offsetY = (cursorY - translate.y) / scale;

    const newTranslateX = cursorX - offsetX * newScale;
    const newTranslateY = cursorY - offsetY * newScale;

    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    translateStartRef.current = { ...translate };
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setTranslate({
      x: translateStartRef.current.x + dx,
      y: translateStartRef.current.y + dy,
    });
  };

  const endDrag = () => setIsDragging(false);

  const handleDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const minScale = minScaleRef.current || 1;
    const isZoomedIn = scale > minScale * 1.05;
    const targetScale = clamp(isZoomedIn ? minScale : scale * 1.6, minScale, 5);

    const offsetX = (cursorX - translate.x) / scale;
    const offsetY = (cursorY - translate.y) / scale;
    const newTranslateX = cursorX - offsetX * targetScale;
    const newTranslateY = cursorY - offsetY * targetScale;

    if (isZoomedIn) {
      // Reset to fitted view
      setScale(minScale);
      setTranslate({ ...initialTranslateRef.current });
    } else {
      setScale(targetScale);
      setTranslate({ x: newTranslateX, y: newTranslateY });
    }
  };

  const handleLandingPinMouseEnter = (index: number) => {
    setHoveredLandingPin(index);
  };

  const handleLandingPinMouseLeave = () => {
    setHoveredLandingPin(null);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToMap = () => {
    setSelectedVideo(null);
    setSelectedVideos(null);
  };

  const handlePinClick = (pinIndex: number, pin: Pin) => {
    if (selectedPin === pinIndex) {
      // Если маркер уже выбран, снимаем выделение и скрываем throwing pins
      setSelectedPin(null);
      setThrowingPins([]);
      setSelectedVideo(null);
      setSelectedVideos(null);
    } else {
      // Выбираем новый маркер и показываем throwing pins
      setSelectedPin(pinIndex);
      setSelectedVideo(null);
      setSelectedVideos(null);

      // Находим видео, которые соответствуют выбранному пину (landing)
      const relatedVideos = videos.filter(
        (video) =>
          video.landing &&
          video.landing.x === pin.x &&
          video.landing.y === pin.y
      );

      // Создаем throwing pins из реальных координат throwing, избегая дублирования
      const throwingCoordinates = new Map<string, Pin>();
      const throwingVideos = new Map<string, Video[]>();

      relatedVideos
        .filter((video) => video.throwing) // Только видео с координатами throwing
        .forEach((video) => {
          const key = `${video.throwing!.x},${video.throwing!.y}`;
          if (!throwingCoordinates.has(key)) {
            throwingCoordinates.set(key, {
              x: video.throwing!.x,
              y: video.throwing!.y,
              type: "throwing",
              amount: 1, // Начинаем с 1 для первого видео
            });
            throwingVideos.set(key, [video]);
          } else {
            // Если координаты уже существуют, увеличиваем количество
            const existingPin = throwingCoordinates.get(key)!;
            existingPin.amount = (existingPin.amount || 1) + 1;
            const existingVideos = throwingVideos.get(key)!;
            existingVideos.push(video);
          }
        });

      const newThrowingPins = Array.from(throwingCoordinates.values());
      setThrowingPins(newThrowingPins);
      // Сохраняем видео для каждого throwing pin
      setThrowingPins((prev) =>
        prev.map((pin) => {
          const key = `${pin.x},${pin.y}`;
          const videos = throwingVideos.get(key) || [];
          return { ...pin, videos };
        })
      );
    }
  };

  // Если выбрано видео, показываем видео плеер
  if (selectedVideo) {
    return (
      <VideoPlayer
        video={selectedVideo}
        onBackToGrid={handleBackToMap}
        backText="Карта"
      />
    );
  }

  // Если выбраны видео для плейлиста, показываем VideoPlayer с плейлистом
  if (selectedVideos && selectedVideos.length > 1) {
    return (
      <VideoPlayer
        videos={selectedVideos}
        onBackToGrid={handleBackToMap}
        backText="Карта"
      />
    );
  }

  // Иначе показываем карту
  return (
    <div
      className="h-[60vh] w-full rounded-md border overflow-hidden relative"
      id="faceit-grenades-button"
    >
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={handleDoubleClick}
        className="relative h-full w-full overflow-hidden"
        style={{
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            draggable={false}
            style={{
              userSelect: "none",
              maxWidth: "none",
              maxHeight: "none",
              width: "auto",
              height: "auto",
              display: "block",
            }}
            onLoad={fitToViewport}
          />

          {/* <div
          style={{
            position: "absolute",
            left: `${(imgRef.current?.naturalWidth || 0) - 397}px`,
            top: `${(imgRef.current?.naturalHeight || 0) - 265}px`,
            transform: `scale(1)`,
            transformOrigin: "left top",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 20,
          }}
          className="pin landing"
        >
          <div className="absolute text-2xl rounded-full w-16 h-16 flex items-center justify-center font-bold shadow-xs">
            {10}
          </div>
        </div> */}

          {/* Пин маркеры - показываем только если нет выбранного пина, или если пин выбран */}
          {pins.map((pin, index) => {
            const isSelected = selectedPin === index;
            const shouldShow = selectedPin === null || isSelected;

            if (!shouldShow) return null;

            const side = getPinSide(pin);
            const { bg, border } = getSideColor(side);
            const isHovered = hoveredLandingPin === index;
            const isOtherHovered =
              hoveredLandingPin !== null && hoveredLandingPin !== index;

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${(imgRef.current?.naturalWidth || 0) - pin.x}px`,
                  top: `${(imgRef.current?.naturalHeight || 0) - pin.y}px`,
                  transform: `scale(1)`,
                  transformOrigin: "left top",
                  pointerEvents: "auto",
                  cursor: "pointer",
                  zIndex: isHovered ? 30 : 20,
                }}
                className="pin landing"
                onMouseEnter={() => handleLandingPinMouseEnter(index)}
                onMouseLeave={handleLandingPinMouseLeave}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinClick(index, pin);
                }}
              >
                {pin.amount && (
                  <div
                    className={`absolute text-xl rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-xs ${bg} ${border} text-orange-custom-text border-3  transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100 select-none ${
                      isOtherHovered ? "opacity-70" : ""
                    }`}
                  >
                    {pin.amount > 1 ? pin.amount : ""}
                  </div>
                )}
              </div>
            );
          })}

          {/* Lines between landing and throwing pins */}
          {selectedPin !== null &&
            throwingPins.map((throwingPin, index) => {
              const selectedPinData = pins[selectedPin!];
              // Проверяем, что selectedPinData существует
              if (!selectedPinData) return null;

              const side = getPinSide(selectedPinData);

              // Calculate coordinates for the line - connecting centers of circles
              // Landing pin is 64px (w-16 h-16), so center offset is 32px
              const landingX =
                (imgRef.current?.naturalWidth || 0) - selectedPinData.x + 24;
              const landingY =
                (imgRef.current?.naturalHeight || 0) - selectedPinData.y + 24;
              // Throwing pin is 48px (w-12 h-12), so center offset is 24px
              const throwingX =
                (imgRef.current?.naturalWidth || 0) - throwingPin.x + 20;
              const throwingY =
                (imgRef.current?.naturalHeight || 0) - throwingPin.y + 20;

              return (
                <svg
                  key={`line-${index}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    zIndex: 15,
                  }}
                >
                  <line
                    x1={landingX}
                    y1={landingY}
                    x2={throwingX}
                    y2={throwingY}
                    stroke="currentColor"
                    strokeDasharray="6"
                    strokeLinecap="round"
                    strokeDashoffset="1000"
                    className={`stroke-[4px] md:stroke-[3px] text-white opacity-70 hover:opacity-100 ${
                      hoveredThrowingPin !== null &&
                      hoveredThrowingPin !== index
                        ? "opacity-50"
                        : ""
                    }`}
                  />
                </svg>
              );
            })}

          {/* Throwing pins - показываем только когда выбран пин */}
          {throwingPins.map((throwingPin, index) => {
            // Находим видео, связанные с выбранным пином, чтобы определить сторону
            const selectedPinData = pins[selectedPin!];
            // Проверяем, что selectedPinData существует
            if (!selectedPinData) return null;

            const side = getPinSide(selectedPinData);
            const { bg, border } = getSideColor(side, true);
            const isHovered = hoveredThrowingPin === index;
            const isOtherHovered =
              hoveredThrowingPin !== null && hoveredThrowingPin !== index;

            // Определяем оптимальную сторону для тултипа
            const pinX = (imgRef.current?.naturalWidth || 0) - throwingPin.x;
            const pinY = (imgRef.current?.naturalHeight || 0) - throwingPin.y;
            const containerWidth = containerRef.current?.clientWidth || 0;
            const containerHeight = containerRef.current?.clientHeight || 0;

            // Учитываем масштаб и трансформацию при расчете позиции
            const scaledPinX = pinX * scale + translate.x;
            const scaledPinY = pinY * scale + translate.y;

            const optimalSide = imageLoaded
              ? getOptimalTooltipSide(
                  scaledPinX,
                  scaledPinY,
                  containerWidth,
                  containerHeight
                )
              : "right"; // По умолчанию справа, пока изображение не загружено

            return (
              <div
                key={`throwing-${index}`}
                style={{
                  position: "absolute",
                  left: `${
                    (imgRef.current?.naturalWidth || 0) - throwingPin.x
                  }px`,
                  top: `${
                    (imgRef.current?.naturalHeight || 0) - throwingPin.y
                  }px`,
                  transform: `scale(1)`,
                  transformOrigin: "center",
                  pointerEvents: "auto",
                  cursor: "pointer",
                  zIndex: 25,
                }}
                className={`pin throwing absolute text-xl rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-xs ${bg} ${border} border-4 transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-100 ${
                  isOtherHovered ? "opacity-70" : ""
                }`}
                onMouseEnter={() => setHoveredThrowingPin(index)}
                onMouseLeave={() => setHoveredThrowingPin(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  // Если у throwing pin нет amount или amount === 1, открываем одно видео
                  if (!throwingPin.amount || throwingPin.amount === 1) {
                    const video = throwingPin.videos?.[0];
                    if (video) {
                      handleVideoClick(video);
                    }
                  }
                  // Если у throwing pin amount > 1, открываем плейлист
                  else if (
                    throwingPin.amount &&
                    throwingPin.amount > 1 &&
                    throwingPin.videos
                  ) {
                    setSelectedVideos(throwingPin.videos);
                  }
                }}
              >
                {throwingPin.amount && (
                  <span className="text-xl font-bold text-white select-none">
                    {throwingPin.amount > 1 ? throwingPin.amount : ""}
                  </span>
                )}

                {/* Video tooltip для одного видео (когда нет amount) */}
                {(!throwingPin.amount || throwingPin.amount === 1) &&
                  throwingPin.videos?.[0] && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="w-full h-full" />
                      </TooltipTrigger>
                      <TooltipContent
                        side={optimalSide}
                        sideOffset={10}
                        align="center"
                        className="p-0 bg-transparent border-none shadow-none"
                      >
                        <VideoTooltip
                          video={throwingPin.videos[0]}
                          index={0}
                          onClick={handleVideoClick}
                        />
                      </TooltipContent>
                    </Tooltip>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
