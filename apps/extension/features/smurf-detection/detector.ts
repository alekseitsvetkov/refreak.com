import {
  getPlayer,
  getPlayerStats,
  getPlayerHistory,
  getMultiplePlayersDataParallel,
} from "../../lib/faceit-api";
import { MatchRoomUtils } from "../../lib/match-room";
import { queryClient } from "../../lib/react-query-provider";
import { faceitQueryKeys } from "../../hooks/use-faceit-api";
import { saveToCache, getFromCache } from "../../lib/cache-sync";
import { DomUtils } from "./dom-utils";
import {
  TIMEOUTS,
  SMURF_ANALYSIS_THRESHOLDS,
  CONFIDENCE_SCORES,
  DEFAULT_SMURF_CONFIG,
} from "./constants";
import type {
  SmurfData,
  SmurfDetectionConfig,
  PlayerStats,
  FaceitUser,
  MatchHistory,
} from "./types";

export class SmurfDetector {
  private config: SmurfDetectionConfig;
  private processedPlayers = new Set<string>();

  constructor(config: Partial<SmurfDetectionConfig> = {}) {
    this.config = { ...DEFAULT_SMURF_CONFIG, ...config };
  }

  clearProcessedPlayers(): void {
    this.processedPlayers.clear();
  }

  async analyzePlayer(nickname: string): Promise<SmurfData | null> {
    try {
      const playerCacheKey = `player:${nickname}`;
      let cachedPlayer = await getFromCache(playerCacheKey);

      let player: FaceitUser | null;
      if (cachedPlayer) {
        player = cachedPlayer as FaceitUser;
      } else {
        player = await getPlayer(nickname);
        if (player) {
          await saveToCache(playerCacheKey, player, "player");
          const playerQueryKey = faceitQueryKeys.player(nickname);
          queryClient.setQueryData(playerQueryKey, player);
        }
      }

      if (!player) {
        return null;
      }

      const statsCacheKey = `stats:${player.userId}:cs2:20`;
      let cachedStats = await getFromCache(statsCacheKey);

      let stats: PlayerStats | null;
      if (cachedStats) {
        stats = cachedStats as PlayerStats;
      } else {
        stats = await getPlayerStats(player.userId, "cs2", 20);
        if (stats) {
          await saveToCache(statsCacheKey, stats, "playerStats");
          const statsQueryKey = faceitQueryKeys.playerStats(
            player.userId,
            "cs2",
            20
          );
          queryClient.setQueryData(statsQueryKey, stats);
        }
      }

      if (!stats) {
        return null;
      }

      let history = null;
      try {
        const historyCacheKey = `history:${player.userId}:0`;
        let cachedHistory = await getFromCache(historyCacheKey);

        if (cachedHistory) {
          history = cachedHistory as MatchHistory;
        } else {
          history = await getPlayerHistory(player.userId, 0);
          if (history) {
            await saveToCache(historyCacheKey, history, "playerHistory");
            const historyQueryKey = faceitQueryKeys.playerHistory(
              player.userId,
              0
            );
            queryClient.setQueryData(historyQueryKey, history);
          }
        }
      } catch (error) {}

      return this.calculateSmurfIndicator(nickname, player, stats, history);
    } catch (error) {
      console.error(`Failed to analyze player ${nickname}:`, error);
      return null;
    }
  }

  analyzePlayerWithData(
    nickname: string,
    player: FaceitUser,
    stats: PlayerStats | null,
    history: MatchHistory | null
  ): SmurfData | null {
    if (!stats) {
      return null;
    }

    return this.calculateSmurfIndicator(nickname, player, stats, history);
  }

  private calculateSmurfIndicator(
    nickname: string,
    player: FaceitUser,
    stats: PlayerStats,
    history: MatchHistory | null
  ): SmurfData | null {
    const reasons: string[] = [];
    let confidence = 0;

    if (stats.matches > this.config.maxMatches) {
      return null;
    } else if (stats.matches < SMURF_ANALYSIS_THRESHOLDS.VERY_LOW_MATCHES) {
      reasons.push(`Very low match count: ${stats.matches}`);
      confidence += CONFIDENCE_SCORES.VERY_LOW_MATCHES;
    } else if (stats.matches < SMURF_ANALYSIS_THRESHOLDS.LOW_MATCHES) {
      reasons.push(`Low match count: ${stats.matches}`);
      confidence += CONFIDENCE_SCORES.LOW_MATCHES;
    } else if (stats.matches < SMURF_ANALYSIS_THRESHOLDS.MODERATE_MATCHES) {
      reasons.push(`Moderate match count: ${stats.matches}`);
      confidence += CONFIDENCE_SCORES.MODERATE_MATCHES;
    } else if (stats.matches < SMURF_ANALYSIS_THRESHOLDS.AVERAGE_MATCHES) {
      reasons.push(`Average match count: ${stats.matches}`);
      confidence += CONFIDENCE_SCORES.AVERAGE_MATCHES;
    }

    if (stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.HIGH_KD_RATIO) {
      reasons.push(`Extremely high K/D ratio: ${stats.averageKDRatio}`);
      confidence += CONFIDENCE_SCORES.EXTREMELY_HIGH_KD;
    } else if (
      stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.VERY_HIGH_KD_RATIO
    ) {
      reasons.push(`Very high K/D ratio: ${stats.averageKDRatio}`);
      confidence += CONFIDENCE_SCORES.VERY_HIGH_KD;
    } else if (stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.GOOD_KD_RATIO) {
      reasons.push(`High K/D ratio: ${stats.averageKDRatio}`);
      confidence += CONFIDENCE_SCORES.HIGH_KD;
    } else if (
      stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.ABOVE_AVERAGE_KD_RATIO
    ) {
      reasons.push(`Above average K/D ratio: ${stats.averageKDRatio}`);
      confidence += CONFIDENCE_SCORES.ABOVE_AVERAGE_KD;
    } else if (
      stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.BASIC_KD_RATIO
    ) {
      reasons.push(`Good K/D ratio: ${stats.averageKDRatio}`);
      confidence += CONFIDENCE_SCORES.GOOD_KD;
    }

    if (stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.HIGH_KD_RATIO) {
      reasons.push(`Extremely high K/R ratio: ${stats.averageKRRatio}`);
      confidence += 30;
    } else if (
      stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.VERY_HIGH_KD_RATIO
    ) {
      reasons.push(`Very high K/R ratio: ${stats.averageKRRatio}`);
      confidence += 25;
    } else if (stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.GOOD_KD_RATIO) {
      reasons.push(`High K/R ratio: ${stats.averageKRRatio}`);
      confidence += 20;
    } else if (
      stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.ABOVE_AVERAGE_KD_RATIO
    ) {
      reasons.push(`Above average K/R ratio: ${stats.averageKRRatio}`);
      confidence += 12;
    } else if (
      stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.BASIC_KD_RATIO
    ) {
      reasons.push(`Good K/R ratio: ${stats.averageKRRatio}`);
      confidence += 8;
    }

    if (stats.winRate > SMURF_ANALYSIS_THRESHOLDS.HIGH_WIN_RATE) {
      reasons.push(`Extremely high win rate: ${stats.winRate}%`);
      confidence += CONFIDENCE_SCORES.HIGH_WIN_RATE;
    } else if (stats.winRate > SMURF_ANALYSIS_THRESHOLDS.VERY_HIGH_WIN_RATE) {
      reasons.push(`Very high win rate: ${stats.winRate}%`);
      confidence += CONFIDENCE_SCORES.VERY_HIGH_WIN_RATE;
    } else if (stats.winRate > SMURF_ANALYSIS_THRESHOLDS.GOOD_WIN_RATE) {
      reasons.push(`High win rate: ${stats.winRate}%`);
      confidence += CONFIDENCE_SCORES.GOOD_WIN_RATE;
    } else if (
      stats.winRate > SMURF_ANALYSIS_THRESHOLDS.ABOVE_AVERAGE_WIN_RATE
    ) {
      reasons.push(`Above average win rate: ${stats.winRate}%`);
      confidence += CONFIDENCE_SCORES.ABOVE_AVERAGE_WIN_RATE;
    } else if (stats.winRate > SMURF_ANALYSIS_THRESHOLDS.BASIC_WIN_RATE) {
      reasons.push(`Good win rate: ${stats.winRate}%`);
      confidence += CONFIDENCE_SCORES.BASIC_WIN_RATE;
    }

    if (player.level) {
      if (player.level <= SMURF_ANALYSIS_THRESHOLDS.LOW_LEVEL) {
        reasons.push(`Very low level: ${player.level}`);
        confidence += CONFIDENCE_SCORES.VERY_LOW_LEVEL;
      } else if (player.level <= SMURF_ANALYSIS_THRESHOLDS.MODERATE_LEVEL) {
        reasons.push(`Low level: ${player.level}`);
        confidence += CONFIDENCE_SCORES.LOW_LEVEL;
      } else if (player.level <= SMURF_ANALYSIS_THRESHOLDS.AVERAGE_LEVEL) {
        reasons.push(`Moderate level: ${player.level}`);
        confidence += CONFIDENCE_SCORES.MODERATE_LEVEL;
      } else if (player.level <= SMURF_ANALYSIS_THRESHOLDS.HIGH_LEVEL) {
        reasons.push(`Average level: ${player.level}`);
        confidence += CONFIDENCE_SCORES.AVERAGE_LEVEL;
      } else if (player.level <= SMURF_ANALYSIS_THRESHOLDS.VERY_HIGH_LEVEL) {
        reasons.push(`High level: ${player.level}`);
        confidence += CONFIDENCE_SCORES.HIGH_LEVEL;
      }
    }

    if (
      stats.matches < SMURF_ANALYSIS_THRESHOLDS.VERY_LOW_MATCHES &&
      stats.averageKDRatio > SMURF_ANALYSIS_THRESHOLDS.HIGH_KD_RATIO &&
      stats.winRate > SMURF_ANALYSIS_THRESHOLDS.HIGH_WIN_RATE
    ) {
      reasons.push(`Classic smurf pattern: high stats with low matches`);
      confidence += CONFIDENCE_SCORES.CLASSIC_SMURF_PATTERN;
    }

    if (
      stats.matches < SMURF_ANALYSIS_THRESHOLDS.MODERATE_MATCHES &&
      stats.averageKRRatio > SMURF_ANALYSIS_THRESHOLDS.HIGH_KD_RATIO &&
      stats.winRate > SMURF_ANALYSIS_THRESHOLDS.GOOD_WIN_RATE
    ) {
      reasons.push(`High K/R with low matches: potential smurf`);
      confidence += CONFIDENCE_SCORES.HIGH_KR_WITH_LOW_MATCHES;
    }

    if (
      stats.matches < SMURF_ANALYSIS_THRESHOLDS.LOW_MATCHES &&
      stats.averageHeadshots >
        SMURF_ANALYSIS_THRESHOLDS.HIGH_HEADSHOT_PERCENTAGE
    ) {
      reasons.push(`High headshot percentage: ${stats.averageHeadshots}%`);
      confidence += CONFIDENCE_SCORES.HIGH_HEADSHOT;
    }

    if (
      stats.matches < SMURF_ANALYSIS_THRESHOLDS.LOW_MATCHES &&
      stats.averageADR > SMURF_ANALYSIS_THRESHOLDS.HIGH_ADR
    ) {
      reasons.push(`High ADR: ${stats.averageADR}`);
      confidence += CONFIDENCE_SCORES.HIGH_ADR_SCORE;
    }

    confidence = Math.min(confidence, 100);

    if (confidence >= SMURF_ANALYSIS_THRESHOLDS.MIN_CONFIDENCE_THRESHOLD) {
      return {
        nickname,
        confidence,
        reasons,
        stats,
      };
    }

    return null;
  }

  async detectSmurfsInMatch(): Promise<SmurfData[]> {
    await new Promise((resolve) =>
      setTimeout(resolve, TIMEOUTS.DOM_DETECTION_DELAY)
    );

    const allNicknames = await DomUtils.extractPlayerNicknames();

    if (allNicknames.length === 0) {
      console.warn("No player nicknames found, skipping smurf detection");
      return [];
    }

    return this.analyzePlayersData(allNicknames);
  }

  private async analyzePlayersData(nicknames: string[]): Promise<SmurfData[]> {
    try {
      const playersData = await getMultiplePlayersDataParallel(nicknames);
      const smurfs: SmurfData[] = [];
      let processedCount = 0;
      let failedCount = 0;

      for (const [nickname, data] of playersData) {
        if (this.processedPlayers.has(nickname)) {
          continue;
        }

        this.processedPlayers.add(nickname);

        if (!data.player) {
          failedCount++;
          continue;
        }

        const smurfData = this.analyzePlayerWithData(
          nickname,
          data.player,
          data.stats,
          data.history
        );

        if (smurfData) {
          smurfs.push(smurfData);
        }

        processedCount++;
      }

      return smurfs;
    } catch (error) {
      console.error("Failed to run smurf detection:", error);
      return [];
    }
  }
}
