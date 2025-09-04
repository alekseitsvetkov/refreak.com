import type {
  PlayerStats,
  FaceitUser,
  MatchHistory,
} from "../../lib/faceit-api";

export interface SmurfData {
  nickname: string;
  confidence: number;
  reasons: string[];
  stats?: PlayerStats;
}

export interface SmurfDetectionConfig {
  minMatches: number;
  maxMatches: number;
  minKDRatio: number;
  minWinRate: number;
  maxAccountAge: number;
  suspiciousLevels: number[];
}

export interface SmurfDetectionSettings {
  enabled: boolean;
  smurfDetection: boolean;
}

export type { PlayerStats, FaceitUser, MatchHistory };
