export interface Video {
  title: string;
  type?: "video";
  poster?: string;
  sources?: Array<{ src: string; type: string }>;
  url?: string;
  side?: "t" | "ct";
  grenadeType?: "smokes" | "flashbangs" | "molotovs" | "he";
  landing?: { x: number; y: number };
  throwing?: { x: number; y: number };
  technique?: string;
  movement?: string;
  precision?: string;
  assets?: {
    videoThumbnail?: {
      webm?: string;
      mp4?: string;
    };
  };
}

export interface GameMap {
  key: string;
  name: string;
  icon: string;
  videos: Video[];
}

export interface Pin {
  x: number;
  y: number;
  amount?: number;
  type?: string;
  videos?: Video[];
}

export interface GrenadesDialogProps {
  container: HTMLElement;
}

export type Side = "t" | "ct";
export type GrenadeType = "smokes" | "flashbangs" | "molotovs" | "he";
export type ViewType = "list" | "interactive_map" | "instant";
